import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
class UMoneyConfig {
  constructor(private configService: ConfigService) {}

  get token(): string {
    return this.configService.get('YOOMONEY_TOKEN', '');
  }

  get webhookEndpoint(): string {
    return this.configService.get('YOOMONEY_WEBHOOK_ENDPOINT', '');
  }

  get clientId(): string {
    return this.configService.get('YOOMONEY_CLIENT_ID', '');
  }

  get redirectUrl(): string {
    return this.configService.get('YOOMONEY_REDIRECT_URL', '');
  }

  get clientSecret(): string {
    return this.configService.get('YOOMONEY_CLIENT_SECRET', '');
  }

  get receiverAddress(): string {
    return this.configService.get('YOOMONEY_ACCOUNT_ADDRESS', '');
  }
}

export default UMoneyConfig;
