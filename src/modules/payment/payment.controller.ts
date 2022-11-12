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
import { createHmac } from 'crypto';
import { v4 } from 'uuid';
import WpayInvoiceSuccessDto from './dto/wpay-invoice-success.dto';
import { AccountService } from '../account/account.service';
import { Repository } from 'typeorm';
import OrderEntity, { OrderStatus } from './order.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { AccountLVL } from '../account/account.entity';
import QiwiConfig from 'src/common/config/qiwi';
import moment from 'moment';
import QiwiCreateInvoiceDto from './dto/qiwi-create-invoice.dto';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const QiwiBillPaymentsAPI = require('@qiwi/bill-payments-node-js-sdk');

@Controller('payment')
export class PaymentController {
  constructor(
    private wpayConfig: WpayConfig,
    private qiwiConfig: QiwiConfig,
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

    const account = await this.accountService.getById(order.accountID);

    if (!account) {
      throw new NotFoundException(`No account with ${account.id} id`);
    }

    await this.orderModel.update(
      { orderID: dto.orderReference },
      { status: OrderStatus.COMPLETE },
    );

    await this.accountService.updateById(order.accountID, {
      accountLVL: AccountLVL.PRIME,
      coins: Number(account.coins) + Number(order.productCount),
    });
  }

  @Get('wpay-invoice')
  async createWpayInvoice(@Query() dto: WpayCreateInvoiceDto) {
    const productPrice = 0.01;

    const orderID = v4();
    const account = await this.accountService.getByTelegramId(
      dto.telegramUserId,
    );

    if (!account) {
      throw new NotFoundException(
        `No account with ${dto.telegramUserId} telegram id`,
      );
    }

    await this.orderModel.save({
      orderID,
      accountID: account.id,
      productCount: dto.productCount,
    });

    const params = {
      merchantDomainName: this.wpayConfig.merchantDomain,
      merchantSignature: '',
      transactionType: 'CREATE_INVOICE',
      merchantAccount: this.wpayConfig.merchantAccount,
      apiVersion: 1,
      serviceUrl: this.wpayConfig.webhookEndpoint,
      orderReference: orderID,
      orderDate: Date.now(),
      amount: productPrice * dto.productCount,
      currency: 'USD',
      productName: ['ЧАТ'],
      productPrice: [productPrice],
      productCount: [dto.productCount],
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

  @Get('qiwi-invoice')
  async createQiwiInvoice(@Query() dto: QiwiCreateInvoiceDto) {
    const qiwiApi = new QiwiBillPaymentsAPI(this.qiwiConfig.secretKey);
    const billId = v4();

    const fields = {
      amount: 100,
      currency: 'RUB',
      comment: 'Prime account',
      expirationDateTime: moment().add('2', 'hours').toString(),
      account: dto.telegramUserId,
      successUrl: this.qiwiConfig.webhookEndpoint,
    };

    const { payUrl } = await qiwiApi.createBill(billId, fields);

    return payUrl;
  }

  @Post('qiwi-invoice-success')
  async onQiwiInvoiceSuccess(@Body() dto: any, @Query() query: any) {
    console.log('dto', dto);
  }
}
