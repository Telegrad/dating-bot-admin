import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import ChatEntity from './chat.entity';
import CreateChatDto from './dto/create-chat.dto';
import GetChatsListQueryDto from './dto/get-chats-list-query.dto';
import UpdateChatDto from './dto/update-chat.dto';

@Injectable()
export default class ChatRepository {
  constructor(
    @InjectRepository(ChatEntity) private model: Repository<ChatEntity>,
  ) {}

  save(dto: CreateChatDto) {
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
}
