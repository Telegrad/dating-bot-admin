import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import AccountEntity, { Gender } from '../account/account.entity';
import ChatEntity from './chat.entity';
import CreateChatDto from './dto/create-chat.dto';
import GetChatsListQueryDto from './dto/get-chats-list-query.dto';
import UpdateChatDto from './dto/update-chat.dto';
import QueueEntity from './queue.entity';

type MatchUsersInQueueData = {
  telegramUserId: string;
  pairedWithTelegramUserChatId: string;
};

type AddToQueueData = {
  telegramUserId: string;
  chatId: string;
  onlyGender?: Gender;
  userGender: Gender;
};

type FindPairedUser = {
  telegramUserId: string;
  chatId: string;
};

@Injectable()
export default class ChatRepository {
  constructor(
    @InjectRepository(ChatEntity) private model: Repository<ChatEntity>,
    @InjectRepository(QueueEntity) private queueModel: Repository<QueueEntity>,
    @InjectRepository(AccountEntity)
    private accountModel: Repository<AccountEntity>,
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
    // await Promise.all([
    //   this.accountModel.update(
    //     { telegramUserId: data.telegramUserId },
    //     { lastConversationUserID: data.pairedWithTelegramUserChatId },
    //   ),
    //   this.accountModel.update(
    //     { telegramUserId: data.pairedWithTelegramUserChatId },
    //     { lastConversationUserID: data.telegramUserId },
    //   ),
    // ]);
    return this.queueModel.update(
      { telegramUserId: data.telegramUserId },
      {
        pairedWithTelegramUserChatId: data.pairedWithTelegramUserChatId,
      },
    );
  }

  async getNextFromQueue(
    chatId: string,
    account: AccountEntity,
    gender?: Gender,
  ) {
    const baseConditions = {
      pairedWithTelegramUserChatId: IsNull(),
      chatId: Not(chatId),
      // telegramUserId: Not(account.lastConversationUserID),
    };
    let user = null;

    // ???????? ?? ???????? ???????? ?????? ?? ???? ???? ???????? ???? ????????
    if (account.gender && !gender) {
      user = await this.queueModel.findOne({
        where: { ...baseConditions, onlyGender: account.gender },
      });
    }

    if (!user) {
      // ???????? ?? ???????????????? ???????? ?????? ?????? ?????? ???? ???? ???????? ???? ????????
      if ((account.gender && gender) || (!account.gender && gender)) {
        user = await this.queueModel.findOne({
          where: {
            ...baseConditions,
            userGender: gender,
          },
        });
      } else {
        // ???????? ???? onlyGender ???? ??????????
        user = await this.queueModel.findOne({
          where: {
            ...baseConditions,
          },
        });
      }
    }

    return user ?? null;
  }

  async isPairedInQueue(chatId: string): Promise<boolean> {
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

  async findPairedUser(params: FindPairedUser): Promise<string | null> {
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

  async stopConversation(chatId: string): Promise<QueueEntity> {
    const v = await this.queueModel.findOne({
      where: [{ chatId }, { pairedWithTelegramUserChatId: chatId }],
    });

    if (v) {
      await v.remove();
    }

    return v;
  }
}
