import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class RegisterDto {
    @IsString()
    @IsNotEmpty()
    username: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsString()
    @IsOptional()
    publicKey?: string;

    @IsString()
    @IsOptional()
    privateKey?: string;
}
