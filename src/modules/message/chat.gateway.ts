import { Inject } from '@nestjs/common';
import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { RoomService } from '../room/room.service';
import { UserService } from '../user/user.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { Server, Socket } from 'socket.io';
import { MessageService } from './message.service';

@WebSocketGateway({
    cors: {
        origin: '*', // Cho phép tất cả các nguồn
    },
})
export class ChatGateway implements OnGatewayDisconnect {
    @WebSocketServer() server: Server;

    // Map để lưu trữ socketId theo userId
    private userSocketMap = new Map<number, string>();

    constructor(
        @Inject(RoomService) private roomService: RoomService,
        @Inject(UserService) private userService: UserService,
        @Inject(MessageService) private messageService: MessageService,
    ) {}

    // Lắng nghe sự kiện 'send_message' từ client
    @SubscribeMessage('send_message')
    async handleMessage(@MessageBody() createMessageDto: CreateMessageDto, client: Socket): Promise<void> {
        const { userId, content, roomId, type, userReceiveId } = createMessageDto;
        console.log(`Client ${client} gửi tin nhắn: ${content}`);
        if (type === 'single') {
            // Kiểm tra phòng chat 1:1 giữa userId và receiverId
            let room = await this.roomService.findByUserIds([userId, userReceiveId]);
            console.log('room', room);

            if (!room) {
                // Nếu phòng chưa tồn tại, tạo phòng mới cho 2 người này
                room = await this.roomService.createRoom({
                    name: 'Private chat',
                    userIds: [userId, userReceiveId],
                    isGroup: false,
                });
            }

            if (room) {
                await this.messageService.createMessage({
                    content,
                    roomId: room.id,
                    userId,
                    type,
                });
                // Gửi tin nhắn vào tất cả các người dùng trong nhóm
                room.users.forEach((user) => {
                    const socketId = this.userSocketMap.get(user.id);
                    if (socketId) {
                        this.server.to(socketId).emit('message', {
                            userId,
                            content,
                            timestamp: new Date(),
                        });
                    }
                });
            }
        } else if (type === 'group') {
            // Gửi tin nhắn vào nhóm
            const room = await this.roomService.findRoomById(roomId);

            if (room) {
                await this.messageService.createMessage({
                    content,
                    roomId: room.id,
                    userId,
                    type,
                });
                // Gửi tin nhắn vào tất cả các người dùng trong nhóm
                room.users.forEach((user) => {
                    const socketId = this.userSocketMap.get(user.id);
                    if (socketId) {
                        this.server.to(socketId).emit('message', {
                            userId,
                            content,
                            timestamp: new Date(),
                        });
                    }
                });
            }
        }
    }

    // Kết nối người dùng khi họ tham gia
    async handleConnection(client: Socket) {
        const userId = client.handshake.query.userId; // Giả sử bạn gửi userId trong query string khi kết nối

        if (!userId) {
            console.log(`Client ${client.id} không có userId, ngắt kết nối`);
            client.disconnect();
            return;
        }

        // Lưu trữ socketId theo userId
        this.userSocketMap.set(Number(userId), client.id);
        console.log(`Client ${client.id} kết nối, userId: ${userId}`);
    }

    // Xử lý khi người dùng ngắt kết nối
    handleDisconnect(client: Socket) {
        // Tìm userId dựa trên socketId và xóa khỏi map
        this.userSocketMap.forEach((socketId, userId) => {
            if (socketId === client.id) {
                this.userSocketMap.delete(userId);
                console.log(`Client ${client.id} đã ngắt kết nối, userId: ${userId}`);
            }
        });
    }

    // Xóa socketId khỏi map khi ngắt kết nối
    async onGatewayDisconnect(client: Socket) {
        this.handleDisconnect(client);
    }
}
