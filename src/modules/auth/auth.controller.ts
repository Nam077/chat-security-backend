import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { CurrentUser } from 'src/auth.decorator';
import { JwtAuthGuard } from './jwt.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { User } from '../user/entities/user.entity';

@Controller('auth')
@ApiBearerAuth()
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        const user = await this.authService.login(loginDto); // Xác thực người dùng và phát hành JWT
        return user;
    }
    @Get('me')
    @UseGuards(JwtAuthGuard)
    async me(@CurrentUser<User>() user) {
        return this.authService.validateUser(user.id);
    }
}
