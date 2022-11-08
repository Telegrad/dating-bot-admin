import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import ChatRepository from './chat.repository';

type OnBotStartData = {
  telegramUserId: number;
  chatId: number;
};

type SocketMessageType = 'video' | 'photo' | 'text' | 'voice' | 'video_note';

type OnMessageData = {
  chatId: number;
  fromTelegramUserId: number;
  value: string | number;
  type: SocketMessageType;
};

type SearchData = {
  chatId: number;
  fromTelegramUserId: number;
};

type OnPartnerFoundData = {
  chatId: number;
  telegramUserId: number;
};

type StopData = {
  chatId: number;
};

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export default class ChatGateway {
  constructor(private repository: ChatRepository) {}

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('message')
  async sendMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: OnMessageData,
  ) {
    const pairedUserChatId = await this.repository.findPairedUser({
      telegramUserId: data.fromTelegramUserId,
      chatId: data.chatId,
    });

    if (pairedUserChatId) {
      socket.emit('message', {
        value: data.value,
        type: data.type,
        chatId: pairedUserChatId,
      } as OnMessageData);
    }
  }

  @SubscribeMessage('bot-start')
  async onBotStart(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: OnBotStartData,
  ) {
    await this.repository.save({
      chat_id: data.chatId,
      telegramUserId: data.telegramUserId,
    });
  }

  @SubscribeMessage('stop')
  async stopConversation(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: StopData,
  ) {
    const participant = await this.repository.stopConversation(data.chatId);

    if (participant) {
      socket.emit('stop', { chatId: data.chatId } as StopData);
      socket.emit('stop', {
        chatId: participant.pairedWithTelegramUserChatId,
      } as StopData);
    }
  }

  @SubscribeMessage('search')
  async search(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: SearchData,
  ) {
    const _search = async () => {
      const queueUser = await this.repository.getNextFromQueue(data.chatId);
      const isPairedInQueue = await this.repository.isPairedInQueue(
        data.chatId,
      );

      if (isPairedInQueue) {
        return;
      }

      if (queueUser) {
        await this.repository.matchUsersInQueue({
          telegramUserId: queueUser.telegramUserId,
          pairedWithTelegramUserChatId: data.chatId, // айдишник юзера что нажал /search
        });
        // notify partners about success match
        socket.emit('partner-found', {
          telegramUserId: queueUser.telegramUserId,
          chatId: queueUser.chatId,
        } as OnPartnerFoundData);
        socket.emit('partner-found', {
          telegramUserId: data.fromTelegramUserId,
          chatId: data.chatId,
        } as OnPartnerFoundData);
        return;
      } else {
        console.log('add ot queue');
        await this.repository.addToQueue({
          telegramUserId: data.fromTelegramUserId,
          chatId: data.chatId,
        });
        setTimeout(() => _search(), 2000); // повторить поиск через 2 сек
      }
    };

    await _search();
  }
}
