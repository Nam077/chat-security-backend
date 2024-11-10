import { Message } from 'src/modules/message/entities/message.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, OneToMany } from 'typeorm';
@Entity()
export class Room {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    aesKey: string; // AES key đã mã hóa sẽ được lưu ở đây

    @ManyToMany(() => User)
    @JoinTable()
    users: User[]; // Những người tham gia phòng này

    @OneToMany(() => Message, (message) => message.room)
    messages: Message[]; // Các tin nhắn trong phòng

    @Column({ default: false })
    isGroup: boolean;
}
