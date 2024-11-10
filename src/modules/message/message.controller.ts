import { Controller, Post, Body, Get, Param, Query, UseGuards } from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt.guard';

@ApiTags('message')
@Controller('messages')
@ApiBearerAuth()
export class MessageController {
    constructor(private messageService: MessageService) {}

    // Tạo tin nhắn mới
    @Post()
    async createMessage(@Body() createMessageDto: CreateMessageDto) {
        return this.messageService.createMessage(createMessageDto);
    }

    @UseGuards(JwtAuthGuard)
    @Get('room/:roomId')
    async getMessagesByRoom(
        @Param('roomId') roomId: number,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
    ) {
        return this.messageService.getMessagesByRoom(roomId, page, limit);
    }
}
