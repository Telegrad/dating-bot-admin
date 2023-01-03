import { NotFoundException } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AccountLVL, Gender } from '../account/account.entity';
import { AccountService } from '../account/account.service';
import ChatRepository from './chat.repository';

type OnBotStartData = {
  telegramUserId: string;
  chatId: string;
};

type SocketMessageType = 'video' | 'photo' | 'text' | 'voice' | 'video_note';

type OnMessageData = {
  chatId: string;
  fromTelegramUserId: string;
  value: string | number;
  type: SocketMessageType;
};

type SearchData = {
  chatId: string;
  fromTelegramUserId: string;
  gender?: Gender;
};

type OnPartnerFoundData = {
  chatId: string;
  telegramUserId: string;
};

type StopData = {
  chatId: string;
  closedByYou?: boolean;
  telegramUserID: string;
};

type NoPrimeAccountData = {
  chatID: string;
};

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export default class ChatGateway {
  constructor(
    private repository: ChatRepository,
    private accountService: AccountService,
  ) {}

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('message')
  async sendMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: OnMessageData,
  ) {
    const pairedUserChatId = await this.repository.findPairedUser({
      telegramUserId: data.fromTelegramUserId.toString(),
      chatId: data.chatId.toString(),
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
      const closedByYou = participant.chatId !== data.chatId;

      socket.emit('stop', {
        chatId: closedByYou ? data.chatId : participant.chatId,
        closedByYou,
      } as StopData);

      if (participant.pairedWithTelegramUserChatId) {
        socket.emit('stop', {
          chatId: participant.pairedWithTelegramUserChatId,
          closedByYou: !closedByYou,
        } as StopData);
      }
    }
  }

  @SubscribeMessage('search')
  async search(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: SearchData,
  ) {
    const account = await this.accountService.getByTelegramId(
      data.fromTelegramUserId.toString(),
    );

    if (data.gender) {
      if (!account) {
        throw new NotFoundException(
          `No account with ${data.fromTelegramUserId} telegram id`,
        );
      }

      if (account.accountLVL !== AccountLVL.PRIME) {
        socket.emit('no-prime-account', {
          chatID: data.fromTelegramUserId,
        } as NoPrimeAccountData);
        return;
      }
    }

    const queueUser = await this.repository.getNextFromQueue(
      data.chatId,
      account,
      data.gender,
    );

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
      await this.repository.addToQueue({
        telegramUserId: data.fromTelegramUserId,
        chatId: data.chatId,
        onlyGender: data.gender,
        userGender: account.gender,
      });
    }
  }
}
