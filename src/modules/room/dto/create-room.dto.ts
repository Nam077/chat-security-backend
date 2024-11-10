import { IsString, IsArray, IsNotEmpty, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateRoomDto {
    @ApiProperty({ example: 'General' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: [1, 2, 3] })
    @IsArray()
    @IsNotEmpty()
    userIds: number[];

    @ApiProperty({ example: true })
    @IsBoolean()
    @Type(() => Boolean)
    @IsNotEmpty()
    isGroup: boolean;
}
