import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  Query,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import WpayConfig from 'src/common/config/wpay';
import WpayCreateInvoiceDto from './dto/wpay-create-invoice.dto';
import { Axios } from 'axios';
import { createHmac } from 'crypto';
import { v4 } from 'uuid';
import WpayInvoiceSuccessDto from './dto/wpay-invoice-success.dto';
import { AccountService } from '../account/account.service';
import { Repository } from 'typeorm';
import OrderEntity, { OrderStatus } from './order.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { AccountLVL } from '../account/account.entity';

@Controller('payment')
export class PaymentController {
  constructor(
    private paymentService: PaymentService,
    private wpayConfig: WpayConfig,
    private accountService: AccountService,
    @InjectRepository(OrderEntity) private orderModel: Repository<OrderEntity>,
  ) {}

  @Post('wpay-invoice-success')
  async onWpayInvoiceSuccess(@Body() dto: WpayInvoiceSuccessDto) {
    const order = await this.orderModel.findOne({
      where: { orderID: dto.orderReference },
    });

    if (!order) {
      throw new NotFoundException(`No order with ${order.id} id`);
    }

    await this.orderModel.update(
      { orderID: dto.orderReference },
      { status: OrderStatus.COMPLETE },
    );
    await this.accountService.updateById(order.accountID, {
      accountLVL: AccountLVL.PRIME,
    });
  }

  @Get('wpay-invoice')
  async createWpayInvoice(@Query() dto: WpayCreateInvoiceDto) {
    const productPrice = 0.01;
    const productCount = 100;

    const orderID = v4();
    const account = await this.accountService.getByTelegramId(
      dto.telegramUserId,
    );

    if (!account) {
      throw new NotFoundException(
        `No account with ${dto.telegramUserId} telegram id`,
      );
    }

    await this.orderModel.save({ orderID, accountID: account.id });

    const params = {
      merchantDomainName: this.wpayConfig.merchantDomain,
      merchantSignature: '',
      transactionType: 'CREATE_INVOICE',
      merchantAccount: this.wpayConfig.merchantAccount,
      apiVersion: 1,
      serviceUrl: this.wpayConfig.webhookEndpoint,
      orderReference: orderID,
      orderDate: Date.now(),
      amount: productPrice * productCount,
      currency: 'USD',
      productName: ['ЧАТ'],
      productPrice: [productPrice],
      productCount: [productCount],
      language: 'ru',
    };

    const md5 = (data) => {
      return createHmac('md5', this.wpayConfig.merchantPassword)
        .update(data)
        .digest('hex');
    };

    const signatureParamsAsString = `${params.merchantAccount};${params.merchantDomainName};${params.orderReference};${params.orderDate};${params.amount};${params.currency};${params.productName[0]};${params.productCount[0]};${params.productPrice[0]}`;
    params.merchantSignature = md5(signatureParamsAsString);

    return params;
  }
}
