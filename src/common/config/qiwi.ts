import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
class QiwiConfig {
  constructor(private configService: ConfigService) {}

  get secretKey(): string {
    return this.configService.get('QIWI_SECRET_KEY', '');
  }

  get publicKey(): string {
    return this.configService.get('QIWI_PUBLIC_KEY', '');
  }

  get merchantDomain(): string {
    return this.configService.get('WPAY_MERCHANT_DOMAIN', '');
  }

  get webhookEndpoint(): string {
    return this.configService.get('QIWI_WEBHOOK_ENDPOINT', '');
  }
}

export default QiwiConfig;
