import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { RoomService } from './room.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { JoinRoomDto } from './dto/join-room.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/auth.decorator';
import { User } from '../user/entities/user.entity';
import { JwtAuthGuard } from '../auth/jwt.guard';

@ApiTags('room')
@Controller('rooms')
@ApiBearerAuth()
export class RoomController {
    constructor(private roomService: RoomService) {}

    // Tạo phòng chat
    @Post()
    async createRoom(@Body() createRoomDto: CreateRoomDto) {
        return this.roomService.createRoom(createRoomDto);
    }

    // Tham gia phòng chat
    @Post('join')
    async joinRoom(@Body() joinRoomDto: JoinRoomDto) {
        return this.roomService.joinRoom(joinRoomDto);
    }

    // Lấy thông tin tất cả phòng của người dùng
    @Get('user/:userId')
    async getUserRooms(@Param('userId') userId: number) {
        return this.roomService.getUserRooms(userId);
    }

    // Lấy thông tin phòng theo ID
    @Get(':id')
    async getRoom(@Param('id') id: number) {
        return this.roomService.findRoomById(id);
    }

    @Get('get-room-by-user/:userId')
    @UseGuards(JwtAuthGuard)
    async getRoomByUser(@CurrentUser<User>() user: User, @Param('userId') userId: number) {
        return this.roomService.getRoomByUser(userId, user);
    }

    @UseGuards(JwtAuthGuard)
    @Get('get-eas-key/:roomId')
    async getAESKey(@Param('roomId') roomId: number, @CurrentUser() user: User) {
        return this.roomService.getAESKey(roomId, user);
    }
}
