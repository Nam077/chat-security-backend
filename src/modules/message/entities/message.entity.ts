import { Room } from 'src/modules/room/entities/room.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

@Entity()
export class Message {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    content: string; // Nội dung tin nhắn

    @Column()
    timestamp: Date; // Thời gian gửi tin nhắn

    @ManyToOne(() => User, (user) => user.messages)
    @JoinColumn({ name: 'user_id' })
    user: User; // Người gửi tin nhắn

    @ManyToOne(() => Room, (room) => room.messages)
    @JoinColumn({ name: 'room_id' })
    room: Room; // Phòng chat mà tin nhắn này thuộc về
}
