import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';
import { UserModule } from '../user/user.module';
import { ConfigModule } from '@nestjs/config';
import { Room } from './entities/room.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Room]), UserModule, ConfigModule.forRoot()],
    controllers: [RoomController],
    providers: [RoomService],
    exports: [RoomService],
})
export class RoomModule {}
