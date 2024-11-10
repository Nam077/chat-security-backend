import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
    @ApiProperty({ example: 'john_doe' })
    @IsString()
    @IsNotEmpty()
    username: string;

    @ApiProperty({ example: 'strongPassword123' })
    @IsString()
    @IsNotEmpty()
    password: string;
}
