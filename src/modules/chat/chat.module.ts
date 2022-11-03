import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatController } from './chat.controller';
import ChatEntity from './chat.entity';
import ChatRepository from './chat.repository';
import { ChatService } from './chat.service';

@Module({
  imports: [TypeOrmModule.forFeature([ChatEntity])],
  controllers: [ChatController],
  providers: [ChatService, ChatRepository],
  exports: [ChatService],
})
export class ChatModule {}
