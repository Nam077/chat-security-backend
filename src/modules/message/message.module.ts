import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { RoomModule } from '../room/room.module';
import { UserModule } from '../user/user.module';
import { ConfigModule } from '@nestjs/config';
import { Message } from './entities/message.entity';
import { ChatGateway } from './chat.gateway';

@Module({
    imports: [TypeOrmModule.forFeature([Message]), RoomModule, UserModule, ConfigModule],
    controllers: [MessageController],
    providers: [MessageService, ChatGateway],
})
export class MessageModule {}
