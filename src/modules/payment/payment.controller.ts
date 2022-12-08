import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  Query,
} from '@nestjs/common';
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
import QiwiCreateInvoiceDto from './dto/qiwi-create-invoice.dto';

import UMoneyConfig from 'src/common/config/umoney';
import UMoneyWebhookDto from './dto/umoney-webhook.dto';

@Controller('payment')
export class PaymentController {
  constructor(
    private wpayConfig: WpayConfig,
    private qiwiConfig: QiwiConfig,
    private accountService: AccountService,
    private umoneyConfig: UMoneyConfig,
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
      dto.telegramUserId.toString(),
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

  @Get('umoney-invoice-form')
  async createUmoneyInvoice(@Query() dto: QiwiCreateInvoiceDto) {
    const orderID = v4();
    const account = await this.accountService.getByTelegramId(
      dto.telegramUserId.toString(),
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

    return `<form method="POST" action="https://yoomoney.ru/quickpay/confirm.xml">
      <input type="hidden" name="receiver" value="${
        this.umoneyConfig.receiverAddress
      }"/>
      <input type="hidden" name="targets" value="Покупка монет в боте t.me/chatvdvoembot">
      <input type="hidden" name="label" value="${orderID}"/>
      <input type="hidden" name="quickpay-form" value="shop"/>
      <input type="hidden" name="sum" value="${
        dto.productCount * dto.productPrice
      }" data-type="number"/>
      <input type="hidden" name="paymentType" value="AC"/>
      <input type="hidden" name="successURL" value="${
        this.umoneyConfig.redirectUrl
      }">

      <input type="submit" value="Оплатить"/>
    </form>`;
  }

  @Post('umoney-invoice-success')
  async onUmoneyInvoiceSuccess(@Body() dto: UMoneyWebhookDto) {
    const purchaseOrderID = dto.label;

    const order = await this.orderModel.findOne({
      where: { orderID: purchaseOrderID },
    });

    if (!order) {
      throw new NotFoundException(`No order with ${order.id} id`);
    }

    const account = await this.accountService.getById(order.accountID);

    if (!account) {
      throw new NotFoundException(`No account with ${account.id} id`);
    }

    await this.orderModel.update(
      { orderID: purchaseOrderID },
      { status: OrderStatus.COMPLETE },
    );

    await this.accountService.updateById(order.accountID, {
      accountLVL: AccountLVL.PRIME,
      coins: Number(account.coins) + Number(order.productCount),
    });
  }
}
