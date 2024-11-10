import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { ConfigModule } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';

@Module({
    imports: [
        UserModule, // Nhúng UserModule để có thể lấy thông tin người dùng khi xác thực
        JwtModule.register({}),
        ConfigModule,
    ],
    providers: [AuthService, JwtStrategy],
    controllers: [AuthController],
    exports: [AuthService],
})
export class AuthModule {}
