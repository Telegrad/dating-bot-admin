import { IsNotEmpty } from 'class-validator';

export default class WpayInvoiceSuccessDto {
  @IsNotEmpty()
  orderReference: string;
}
