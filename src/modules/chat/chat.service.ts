import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import ChatRepository from './chat.repository';
import CreateChatDto from './dto/create-chat.dto';
import GetChatsListQueryDto from './dto/get-chats-list-query.dto';

@Injectable()
export class ChatService {
  constructor(private repository: ChatRepository) {}

  async create(dto: CreateChatDto) {
    const isExist = await this.repository.checkExist(dto);

    if (isExist) {
      throw new ConflictException(
        `Chat with ${dto.chat_id} chat_id already exists`,
      );
    }

    return this.repository.save(dto);
  }

  async deleteById(id: number) {
    const { affected } = await this.repository.deleteById(id);

    if (affected === 0) {
      throw new NotFoundException(`Chat with ${id} id not found`);
    }
  }

  async getById(id: number) {
    const chat = await this.repository.findById(id);

    if (!chat) {
      throw new NotFoundException(`Chat with ${id} id not found`);
    }

    return chat;
  }

  getList(query: GetChatsListQueryDto) {
    return this.repository.find(query);
  }

  countChats() {
    return this.repository.count();
  }
}
