import { IsString, IsNotEmpty, IsNumber, IsEnum } from 'class-validator';

// Enum cho loại tin nhắn
export enum MessageType {
    SINGLE = 'single',
    GROUP = 'group',
}

export class CreateMessageDto {
    @IsString()
    @IsNotEmpty()
    content: string; // Nội dung tin nhắn

    @IsNumber()
    @IsNotEmpty()
    roomId: number; // ID của phòng chat

    @IsNumber()
    @IsNotEmpty()
    userReceiveId?: number; // ID của người nhận

    @IsNumber()
    @IsNotEmpty()
    userId: number; // ID của người gửi

    @IsEnum(MessageType)
    @IsNotEmpty()
    type: MessageType; // Loại tin nhắn: 'single' hoặc 'group'
}
