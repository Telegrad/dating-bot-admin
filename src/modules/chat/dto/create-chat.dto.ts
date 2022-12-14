import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export default class CreateChatDto {
  @ApiProperty()
  @IsNotEmpty()
  chat_id: string;

  @ApiProperty()
  @IsNotEmpty()
  telegramUserId: string;
}
