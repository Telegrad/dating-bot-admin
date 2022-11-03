import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

enum NODE_ENV {
  DEV = 'development',
}

@Injectable()
class ServerConfig {
  constructor(private configService: ConfigService) {}

  get port(): number {
    return this.configService.get('PORT', 3000);
  }

  get isDev(): boolean {
    return this.configService.get('NODE_ENV', NODE_ENV.DEV) === NODE_ENV.DEV;
  }

  get cipherSecretKey(): string {
    return this.configService.get('CIPHER_SECRET_KEY', '');
  }
}

export default ServerConfig;
