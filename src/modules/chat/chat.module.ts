import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import AccountEntity from '../account/account.entity';
import { AccountModule } from '../account/account.module';
import { ChatController } from './chat.controller';
import ChatEntity from './chat.entity';
import ChatGateway from './chat.gateway';
import ChatRepository from './chat.repository';
import { ChatService } from './chat.service';
import QueueEntity from './queue.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatEntity, QueueEntity, AccountEntity]),
    AccountModule,
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatRepository, ChatGateway],
  exports: [ChatService],
})
export class ChatModule {}
