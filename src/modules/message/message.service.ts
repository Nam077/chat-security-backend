import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoomService } from '../room/room.service';
import { UserService } from '../user/user.service';
import { Message } from './entities/message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MessageService {
    constructor(
        @InjectRepository(Message)
        private messageRepository: Repository<Message>,
        private roomService: RoomService,
        private userService: UserService,
        private configService: ConfigService, // Inject ConfigService để lấy secret từ .env
    ) {}

    // Mã hóa nội dung tin nhắn
    private encryptMessage(content: string, aesKey: string): string {
        const iv = crypto.randomBytes(16); // IV phải có kích thước 16 byte cho AES-256-CBC
        const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(aesKey, 'utf8'), iv);
        let encrypted = cipher.update(content, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        // Kết hợp IV và ciphertext
        return iv.toString('hex') + ':' + encrypted;
    }

    // Giải mã nội dung tin nhắn
    private decryptMessage(encryptedContent: string, aesKey: string): string {
        const [ivHex, encrypted] = encryptedContent.split(':');
        const iv = Buffer.from(ivHex, 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(aesKey, 'utf8'), iv);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }

    // Tạo tin nhắn mới
    async createMessage(createMessageDto: CreateMessageDto): Promise<Message> {
        const { content, roomId, userId } = createMessageDto;

        // Kiểm tra xem người dùng có tồn tại không
        const user = await this.userService.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        // Kiểm tra xem phòng chat có tồn tại không và lấy AES key
        const room = await this.roomService.findRoomById(roomId);
        if (!room) {
            throw new Error('Room not found');
        }

        // Mã hóa nội dung tin nhắn bằng AES key của phòng

        // Tạo và lưu tin nhắn
        const message = this.messageRepository.create({
            content: content,
            timestamp: new Date(),
            user,
            room,
        });

        return await this.messageRepository.save(message);
    }

    // Lấy tin nhắn trong phòng chat với phân trang
    async getMessagesByRoom(roomId: number, page: number, limit: number): Promise<Message[]> {
        const messages = await this.messageRepository.find({
            where: { room: { id: roomId } },
            select: {
                id: true,
                content: true,
                timestamp: true,
                user: { id: true, username: true },
            },
            skip: (page - 1) * limit,
            take: limit,
            relations: ['user'],
            order: { timestamp: 'ASC' }, // Sắp xếp theo thời gian
        });

        // Giải mã nội dung tin nhắn trước khi trả về
        return messages;
    }
}
