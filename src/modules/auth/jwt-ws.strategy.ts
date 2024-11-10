import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service'; // Thêm service của bạn
import { JwtPayload } from './jwt.strategy';
import { Socket } from 'socket.io';

@Injectable()
export class JwtWsStrategy extends PassportStrategy(Strategy, 'jwt-ws') {
    constructor(
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService,
        private readonly userService: UserService, // Thêm userService nếu cần
    ) {
        super({
            jwtFromRequest: (req: Socket) => {
                return req?.handshake?.query?.token || null; // Lấy token từ query string của WebSocket request
            },
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_PUBLIC_KEY').replace(/\\n/g, '\n'),
            algorithms: ['RS256'],
        });
    }

    async validate(payload: JwtPayload) {
        // Bạn có thể kiểm tra hoặc tìm user từ database nếu cần
        return await this.userService.findById(payload.sub);
    }
}
