import { Injectable, NotFoundException } from '@nestjs/common';
import { AccountRepository } from './account.repository';
import CreateAccountDto from './dto/create-account.dto';
import GetAccountListDto from './dto/get-account-list.dto';
import UpdateAccountDto from './dto/update-account.dto';

@Injectable()
export class AccountService {
  constructor(private repository: AccountRepository) {}

  async create(dto: CreateAccountDto) {
    return this.repository.save(dto);
  }

  async updateById(id: number, dto: UpdateAccountDto) {
    const { affected } = await this.repository.updateById(id, dto);

    if (affected === 0) {
      throw new NotFoundException(`Account with ${id} not found`);
    }
  }

  async updateByTelegramId(id: string, dto: UpdateAccountDto) {
    const { affected } = await this.repository.updateByTelegramId(id, dto);

    if (affected === 0) {
      throw new NotFoundException(`Account with ${id} not found`);
    }
  }

  async deleteById(id: number) {
    const { affected } = await this.repository.deleteById(id);

    if (affected === 0) {
      throw new NotFoundException(`Account with ${id} not found`);
    }
  }

  countAccounts() {
    return this.repository.count();
  }

  async getById(id: number) {
    const account = await this.repository.findById(id);

    if (!account) {
      throw new NotFoundException(`Account with ${id} not found`);
    }

    return account;
  }

  async getByTelegramId(id: string) {
    const account = await this.repository.findByTelegramId(id);

    if (!account) {
      throw new NotFoundException(
        `Account with telegramUserId ${id} not found`,
      );
    }

    return account;
  }

  async getList(query: GetAccountListDto) {
    return this.repository.find(query);
  }
}
