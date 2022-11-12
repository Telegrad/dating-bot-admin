import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Gender } from '../account/account.entity';

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

  @Column({ nullable: true })
  onlyGender?: Gender;

  @Column({ nullable: true })
  userGender?: Gender;
}
