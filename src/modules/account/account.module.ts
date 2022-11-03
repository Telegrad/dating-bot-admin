import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountController } from './account.controller';
import AccountEntity from './account.entity';
import { AccountRepository } from './account.repository';
import { AccountService } from './account.service';

@Module({
  imports: [TypeOrmModule.forFeature([AccountEntity])],
  controllers: [AccountController],
  providers: [AccountService, AccountRepository],
  exports: [AccountService],
})
export class AccountModule {}
