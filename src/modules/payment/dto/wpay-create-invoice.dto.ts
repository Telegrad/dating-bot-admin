import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export default class WpayCreateInvoiceDto {
  @ApiProperty()
  @IsNotEmpty()
  telegramUserId: number;

  @ApiProperty()
  @IsNotEmpty()
  productCount: number;
}
