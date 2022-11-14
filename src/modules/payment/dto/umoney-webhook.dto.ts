import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export default class UMoneyWebhookDto {
  @ApiProperty()
  @IsNotEmpty()
  label: string;
}
