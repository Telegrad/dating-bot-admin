import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import AccountEntity from '../account/account.entity';
import ChatEntity from './chat.entity';
import { ChatService } from './chat.service';
import CreateChatDto from './dto/create-chat.dto';
import GetChatsListQueryDto from './dto/get-chats-list-query.dto';

@Controller('chats')
export class ChatController {
  constructor(private service: ChatService) {}

  @ApiOkResponse({ type: AccountEntity })
  @ApiConflictResponse({
    description: 'If chat with such chat_id already exists',
  })
  @Post()
  create(@Body() dto: CreateChatDto) {
    return this.service.create(dto);
  }

  // @Put(':id')
  // updateById(@Put('id', ParseIntPipe) id: number, @Body() dto: UpdateChatDto) {
  // }

  @ApiOkResponse()
  @ApiNotFoundResponse({
    description: 'Chat with such id (not chat_id) not found',
  })
  @Delete(':id')
  deleteById(@Param('id', ParseIntPipe) id: number) {
    return this.service.deleteById(id);
  }

  @ApiOkResponse({ type: Number })
  @Get('count')
  getCount() {
    return this.service.countChats();
  }

  @ApiOkResponse({ type: ChatEntity, isArray: true })
  @Get()
  getList(@Query() query: GetChatsListQueryDto) {
    return this.service.getList(query);
  }

  @ApiOkResponse({ type: ChatEntity })
  @ApiNotFoundResponse({
    description: 'Chat with such id (not chat_id) not found',
  })
  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.service.getById(id);
  }
}
