import { ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from './dtos/login.dto';

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private userService: UserService,
        private configService: ConfigService,
    ) {}

    // Đăng nhập người dùng và tạo JWT token
    async login(loginDto: LoginDto) {
        // Tìm người dùng qua username

        const user = await this.userService.findByUsername(loginDto.username);

        if (!user) {
            throw new ForbiddenException('User not found');
        }
        const payload = { username: user.username, sub: user.id };
        const privateKey = this.configService.get<string>('JWT_PRIVATE_KEY').replace(/\\n/g, '\n');

        // Ký JWT token với private key (RSA)
        const token = this.jwtService.sign(payload, {
            privateKey: privateKey,
            algorithm: 'RS256',
            // expiresIn: JWT_EXPIRES_IN,
        });

        return {
            access_token: token,
        };
    }

    // Tìm người dùng qua id (sử dụng trong strategy)
    async validateUser(userId: number): Promise<User> {
        return this.userService.findById(userId);
    }
}
