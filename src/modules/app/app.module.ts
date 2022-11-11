import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';
import ApiConfigModule from '../../common/config/api-config.module';
import PostgresConfig from '../../common/config/postgres';
import { AccountModule } from '../account/account.module';
import { ChatModule } from '../chat/chat.module';
import { PaymentModule } from '../payment/payment.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ApiConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [ApiConfigModule],
      inject: [PostgresConfig],
      useFactory(pgConfig: PostgresConfig): TypeOrmModuleOptions {
        return {
          type: 'postgres',
          host: pgConfig.host,
          port: pgConfig.port,
          username: pgConfig.username,
          password: pgConfig.password,
          database: pgConfig.dbName,
          entities: [join(__dirname, '..', '**', '*.entity{.ts,.js}')],
          synchronize: pgConfig.synchronize,
        };
      },
    }),
    AccountModule,
    ChatModule,
    PaymentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
