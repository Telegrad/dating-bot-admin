import { IsNotEmpty } from 'class-validator';

export default class WpayCreateInvoiceDto {
  @IsNotEmpty()
  telegramUserId: number;
}
