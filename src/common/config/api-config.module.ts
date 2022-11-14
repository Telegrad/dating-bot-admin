import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import PostgresConfig from './postgres';
import QiwiConfig from './qiwi';
import ServerConfig from './server';
import UMoneyConfig from './umoney';
import WpayConfig from './wpay';

@Global()
@Module({
  imports: [ConfigModule.forRoot({ expandVariables: true })],
  providers: [
    ServerConfig,
    PostgresConfig,
    WpayConfig,
    QiwiConfig,
    UMoneyConfig,
  ],
  exports: [ServerConfig, PostgresConfig, WpayConfig, QiwiConfig, UMoneyConfig],
})
export default class ApiConfigModule {}
