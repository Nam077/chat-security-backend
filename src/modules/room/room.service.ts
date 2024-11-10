import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import * as crypto from 'crypto';
import { CreateRoomDto } from './dto/create-room.dto';
import { JoinRoomDto } from './dto/join-room.dto';
import { ConfigService } from '@nestjs/config';
import { Room } from './entities/room.entity';
import { User } from '../user/entities/user.entity';
import { decrypt, encrypt, encryptWithRSA, generateRandomKey } from './hash.util';

@Injectable()
export class RoomService {
    constructor(
        @InjectRepository(Room)
        private roomRepository: Repository<Room>,
        private userService: UserService,
        private configService: ConfigService,
    ) {}

    async checkExistByUserId(userIds: number[]): Promise<boolean> {
        const count = await this.roomRepository
            .createQueryBuilder('room')
            .leftJoin('room.users', 'user')
            .where('user.id IN (:...userIds)', { userIds })
            .groupBy('room.id')
            .having('COUNT(user.id) = :userCount', { userCount: userIds.length })
            .getCount();
        return count > 0;
    }

    async createRoom(createRoomDto: CreateRoomDto): Promise<Room> {
        const { name, userIds } = createRoomDto;
        if (userIds.length < 2) {
            throw new HttpException('At least 2 users are required', HttpStatus.BAD_REQUEST);
        }

        if (await this.checkExistByUserId(userIds)) {
            throw new HttpException('Room already exists', HttpStatus.BAD_REQUEST);
        }

        const users = await this.userService.findByIds(userIds);

        if (users.length !== userIds.length) {
            throw new HttpException('Some users not found', HttpStatus.NOT_FOUND);
        }

        const aesKey = generateRandomKey();
        const encryptedAESKey = encrypt(aesKey, this.configService.get<string>('AES_KEY_SECRET'));

        const room = this.roomRepository.create({
            name,
            aesKey: encryptedAESKey,
            users,
        });

        return await this.roomRepository.save(room);
    }

    async findRoomById(roomId: number): Promise<Room> {
        const room = await this.roomRepository.findOne({
            where: { id: roomId },
            relations: ['users'],
        });

        if (room) {
            room.aesKey = encrypt(room.aesKey, this.configService.get<string>('AES_KEY_SECRET'));
        }

        return room;
    }

    async joinRoom(joinRoomDto: JoinRoomDto): Promise<Room> {
        const room = await this.roomRepository.findOne({
            where: { id: joinRoomDto.roomId },
            relations: ['users'],
        });

        if (!room) {
            throw new Error('Room not found');
        }

        const user = await this.userService.findById(joinRoomDto.roomId);
        if (!user) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }

        if (!room.users.find((u) => u.id === user.id)) {
            room.users.push(user);
            await this.roomRepository.save(room);
        }
        return room;
    }

    async getUserRooms(userId: number): Promise<Room[]> {
        const user = await this.userService.findById(userId);
        return this.roomRepository.find({
            where: { users: [user] },
            relations: ['users'],
        });
    }

    async findByUserIds(userIds: number[]): Promise<Room | undefined> {
        // Tìm các phòng có chứa ít nhất một trong các userIds và nạp tất cả người dùng của phòng
        const rooms = await this.roomRepository.find({
            where: {
                users: {
                    id: In(userIds),
                },
            },
            relations: ['users'], // Nạp tất cả người dùng của phòng
        });

        // Lọc ra phòng có đầy đủ tất cả userIds
        const matchedRoom = rooms.find(
            (room) =>
                room.users.length === userIds.length && // Đảm bảo số lượng người dùng đúng
                userIds.every((id) => room.users.some((user) => user.id === id)), // Đảm bảo phòng chứa tất cả userIds
        );

        return matchedRoom || undefined; // Trả về phòng nếu tìm thấy, ngược lại trả về undefined
    }

    async getRoomByUser(userId: number, user: User) {
        const room = await this.findByUserIds([userId, user.id]);

        if (!room) {
            const roomCreated = await this.createRoom({
                name: 'Private chat',
                userIds: [userId, user.id],
                isGroup: false,
            });
            return roomCreated;
        }
        return room;
    }

    async getAESKey(roomId: number, user: User): Promise<string> {
        const publicKey = await this.userService.findPublicKeyById(user.id);
        if (!publicKey) {
            throw new HttpException('User public key not found', HttpStatus.NOT_FOUND);
        }

        const room = await this.findRoomById(roomId);
        if (!room) {
            throw new HttpException('Room not found', HttpStatus.NOT_FOUND);
        }

        const secureAESKey = encryptWithRSA(
            decrypt(room.aesKey, this.configService.get<string>('AES_KEY_SECRET')),
            await this.userService.findPublicKeyById(user.id),
        );

        return secureAESKey;
    }

    decryptAESKeyWithRSA(encryptedAESKey: string, privateKey: string): string {
        const buffer = Buffer.from(encryptedAESKey, 'base64');
        const decrypted = crypto.privateDecrypt(
            {
                key: privateKey,
                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                oaepHash: 'sha256',
            },
            buffer,
        );

        return decrypted.toString('utf8');
    }
}
