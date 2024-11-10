import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Message } from 'src/modules/message/entities/message.entity';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    username: string;

    @Column()
    passwordHash: string;

    @Column('text', { nullable: true }) // Khóa công khai, được gửi từ client khi cần
    publicKey: string | null;

    @OneToMany(() => Message, (message) => message.user)
    messages: Message[];
}
