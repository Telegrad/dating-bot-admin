import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
class WpayConfig {
  constructor(private configService: ConfigService) {}

  get merchantAccount(): string {
    return this.configService.get('WPAY_MERCHANT_ACCOUNT', '');
  }

  get merchantPassword(): string {
    return this.configService.get('WPAY_MERCHANT_PASS', '');
  }

  get merchantDomain(): string {
    return this.configService.get('WPAY_MERCHANT_DOMAIN', '');
  }

  get webhookEndpoint(): string {
    return this.configService.get('WPAY_WEBHOOK_ENDPOINT', '');
  }
}

export default WpayConfig;
