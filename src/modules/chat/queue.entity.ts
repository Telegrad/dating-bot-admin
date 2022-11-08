import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('chat_queue')
export default class QueueEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  telegramUserId: number;

  @Column()
  chatId: number;

  @Column({ nullable: true })
  pairedWithTelegramUserChatId?: number;
}
