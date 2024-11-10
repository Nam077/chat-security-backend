import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { User } from '../user/entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Lấy JWT từ header Authorization
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_PUBLIC_KEY').replace(/\\n/g, '\n'), // Sử dụng public key để verify token
            algorithms: ['RS256'],
        });
    }

    // Phương thức này sẽ được gọi khi JWT hợp lệ, và trả về userId từ JWT
    async validate(payload: JwtPayload): Promise<User> {
        return this.authService.validateUser(payload.sub);
    }
}
export interface JwtPayload {
    sub: number; // User ID
    username: string; // Username
}
