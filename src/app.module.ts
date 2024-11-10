import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { RoomModule } from './modules/room/room.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { MessageModule } from './modules/message/message.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        TypeOrmModule.forRoot({
            type: 'better-sqlite3',
            database: 'db.sqlite',
            autoLoadEntities: true,
            synchronize: true,
        }),
        UserModule,
        RoomModule,
        AuthModule,
        MessageModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
