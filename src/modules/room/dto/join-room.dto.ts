import { IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class JoinRoomDto {
    @ApiProperty({ example: 1 })
    @IsNumber()
    roomId: number;
}
