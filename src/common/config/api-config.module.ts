import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import PostgresConfig from './postgres';
import ServerConfig from './server';
import WpayConfig from './wpay';

@Global()
@Module({
  imports: [ConfigModule.forRoot({ expandVariables: true })],
  providers: [ServerConfig, PostgresConfig, WpayConfig],
  exports: [ServerConfig, PostgresConfig, WpayConfig],
})
export default class ApiConfigModule {}
