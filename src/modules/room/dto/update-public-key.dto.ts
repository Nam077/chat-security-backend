import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class UpdatePublicKeyDto {
    @ApiProperty({
        description: 'The public key of the user',
        example: 'your-public-key-here',
    })
    @IsString()
    readonly publicKey: string;
}
