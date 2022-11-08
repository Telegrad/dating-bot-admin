import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import ChatEntity from './chat.entity';
import CreateChatDto from './dto/create-chat.dto';
import GetChatsListQueryDto from './dto/get-chats-list-query.dto';
import UpdateChatDto from './dto/update-chat.dto';
import QueueEntity from './queue.entity';

type MatchUsersInQueueData = {
  telegramUserId: number;
  pairedWithTelegramUserChatId: number;
};

type AddToQueueData = {
  telegramUserId: number;
  chatId: number;
};

type FindPairedUser = {
  telegramUserId: number;
  chatId: number;
};

@Injectable()
export default class ChatRepository {
  constructor(
    @InjectRepository(ChatEntity) private model: Repository<ChatEntity>,
    @InjectRepository(QueueEntity) private queueModel: Repository<QueueEntity>,
  ) {}

  async save(dto: CreateChatDto) {
    const chat = await this.model.findOne({
      where: { telegramUserId: dto.telegramUserId },
    });

    if (chat) {
      return this.model.update(chat.id, dto);
    }

    return this.model.save(dto);
  }

  updateById(id: number, dto: UpdateChatDto) {
    return this.model.update(id, dto);
  }

  deleteById(id: number) {
    return this.model.delete(id);
  }

  count() {
    return this.model.count();
  }

  findById(id: number) {
    return this.model.findOne({ where: { id } });
  }

  find(query: GetChatsListQueryDto) {
    return this.model.find({ skip: query.skip, take: query.take });
  }

  async checkExist(dto: CreateChatDto) {
    const chat = await this.model.findOne({ where: { chat_id: dto.chat_id } });

    return !!chat;
  }

  async addToQueue(data: AddToQueueData) {
    const waiter = await this.queueModel.findOne({
      where: { telegramUserId: data.telegramUserId },
    });

    if (!waiter) {
      return this.queueModel.save(data);
    }

    return waiter;
  }

  async matchUsersInQueue(data: MatchUsersInQueueData) {
    return this.queueModel.update(
      { telegramUserId: data.telegramUserId },
      {
        pairedWithTelegramUserChatId: data.pairedWithTelegramUserChatId,
      },
    );
  }

  async getNextFromQueue(chatId: number) {
    const user = await this.queueModel.find({
      take: 1,
      where: { pairedWithTelegramUserChatId: IsNull(), chatId: Not(chatId) },
    });

    return user.length ? user[0] : null;
  }

  async isPairedInQueue(chatId: number): Promise<boolean> {
    const v = await this.queueModel.findOne({
      where: {
        pairedWithTelegramUserChatId: IsNull(),
        chatId,
      },
    });

    if (v) {
      return !!v.pairedWithTelegramUserChatId;
    }

    return false;
  }

  async findPairedUser(params: FindPairedUser): Promise<number | null> {
    // const user = await this.queueModel.findOne({
    //   where: [
    //     {
    //       telegramUserId: params.telegramUserId,
    //     },
    //     {
    //       pairedWithTelegramUserChatId: params.chatId,
    //     },
    //   ],
    // });
    const userFoundByTelegramUserId = await this.queueModel.findOne({
      where: {
        telegramUserId: params.telegramUserId,
      },
    });
    const userFoundByPairedChatId = await this.queueModel.findOne({
      where: {
        pairedWithTelegramUserChatId: params.chatId,
      },
    });

    if (userFoundByPairedChatId) {
      return userFoundByPairedChatId.chatId;
    }

    if (userFoundByTelegramUserId) {
      return userFoundByTelegramUserId.pairedWithTelegramUserChatId;
    }

    return null;
  }

  async stopConversation(chatId: number): Promise<QueueEntity> {
    const v = await this.queueModel.findOne({
      where: [{ chatId }, { pairedWithTelegramUserChatId: chatId }],
    });

    if (v) {
      await v.remove();
    }

    return v;
  }
}
