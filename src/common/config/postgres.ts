import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import ServerConfig from './server';

@Injectable()
class PostgresConfig {
  constructor(
    private readonly configService: ConfigService,
    private readonly serverConfig: ServerConfig,
  ) {}

  get host(): string {
    return this.configService.get('PG_HOST', '127.0.0.1');
  }

  get port(): number {
    return this.configService.get('PG_PORT', 5432);
  }

  get password(): string {
    return this.configService.get('PG_PASS', '');
  }

  get username(): string {
    return this.configService.get('PG_USER', '');
  }

  get dbName(): string {
    return this.configService.get('PG_DB', '');
  }

  get synchronize(): boolean {
    return this.serverConfig.isDev;
  }
}

export default PostgresConfig;
