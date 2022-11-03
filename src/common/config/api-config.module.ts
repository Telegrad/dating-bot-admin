import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import PostgresConfig from './postgres';
import ServerConfig from './server';

@Global()
@Module({
  imports: [ConfigModule.forRoot({ expandVariables: true })],
  providers: [ServerConfig, PostgresConfig],
  exports: [ServerConfig, PostgresConfig],
})
export default class ApiConfigModule {}
