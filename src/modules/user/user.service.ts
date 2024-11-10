import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private configService: ConfigService,
    ) {}

    // Tạo người dùng mới và lưu trữ thông tin cơ bản
    async create(createUserDto: CreateUserDto): Promise<User> {
        const { username, password } = createUserDto;
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        const user = this.userRepository.create({
            username,
            passwordHash,
        });

        return this.userRepository.save(user);
    }

    async findAll(): Promise<User[]> {
        return this.userRepository.find({
            select: ['id', 'username'],
        });
    }
    async findByIds(ids: number[]): Promise<User[]> {
        return this.userRepository.find({
            where: {
                id: In(ids),
            },
            select: ['id', 'username', 'publicKey'],
        });
    }

    // Tìm người dùng theo username
    async findByUsername(username: string): Promise<User> {
        return this.userRepository.findOne({ where: { username } });
    }

    // Tìm người dùng theo ID
    async findById(id: number): Promise<User> {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }
        return user;
    }

    // Cập nhật khóa công khai của người dùng khi họ gửi khóa mới
    async updatePublicKey(userId: number, publicKey: string): Promise<any> {
        const user = await this.findById(userId);
        if (!user) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }

        user.publicKey = publicKey;
        await this.userRepository.save(user);

        return {
            message: 'Public key updated',
        };
    }

    // Lấy khóa công khai của người dùng theo ID
    async findPublicKeyById(id: number): Promise<string | null> {
        const user = await this.findById(id);
        return user.publicKey;
    }
}
