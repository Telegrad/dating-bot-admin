import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('chats')
export default class ChatEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, type: 'bigint' })
  chat_id: string;

  @Column({ type: 'bigint' })
  telegramUserId: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  readonly createdAt: Date = new Date();

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  readonly updatedAt: Date = new Date();
}
