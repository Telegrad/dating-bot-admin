import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export default class QiwiCreateInvoiceDto {
  @ApiProperty()
  @IsNotEmpty()
  telegramUserId: number;

  @ApiProperty()
  @IsNotEmpty()
  productCount: number;

  @ApiProperty()
  @IsNotEmpty()
  productPrice: number;
}
