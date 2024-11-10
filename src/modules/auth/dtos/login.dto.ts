import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class LoginDto {
    @ApiProperty({
        description: 'The username of the user',
        example: 'john_doe',
    })
    @IsString()
    username: string;

    @ApiProperty({
        description: 'The password of the user',
        example: 'strongPassword123',
    })
    @IsString()
    @MinLength(6)
    password: string;
}
