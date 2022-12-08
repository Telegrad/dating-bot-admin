import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Gender } from '../account/account.entity';

@Entity('chat_queue')
export default class QueueEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, type: 'bigint' })
  telegramUserId: string;

  @Column({ type: 'bigint' })
  chatId: string;

  @Column({ nullable: true, type: 'bigint' })
  pairedWithTelegramUserChatId?: string;

  @Column({ nullable: true })
  onlyGender?: Gender;

  @Column({ nullable: true })
  userGender?: Gender;
}
