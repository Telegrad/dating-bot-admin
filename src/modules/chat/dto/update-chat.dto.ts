import CreateChatDto from './create-chat.dto';
import { PartialType } from '@nestjs/swagger';

export default class UpdateChatDto extends PartialType(CreateChatDto) {}
