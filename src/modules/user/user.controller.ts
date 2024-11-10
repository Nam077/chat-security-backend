import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UpdatePublicKeyDto } from '../room/dto/update-public-key.dto';
import { User } from './entities/user.entity';
import { CurrentUser } from 'src/auth.decorator';
import { JwtAuthGuard } from '../auth/jwt.guard';

@ApiTags('user')
@Controller('users')
@ApiBearerAuth()
export class UserController {
    constructor(private userService: UserService) {}

    @Post()
    async create(@Body() createUserDto: CreateUserDto) {
        return this.userService.create(createUserDto);
    }

    @Get(':id')
    async getUserById(@Param('id') id: number) {
        return this.userService.findById(id);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    async getAllUsers() {
        return this.userService.findAll();
    }

    @UseGuards(JwtAuthGuard)
    @Post('public-key')
    async updatePublicKey(@CurrentUser() user: User, @Body() updatePublicKeyDto: UpdatePublicKeyDto) {
        console.log(user);

        return this.userService.updatePublicKey(user.id, updatePublicKeyDto.publicKey);
    }
}
