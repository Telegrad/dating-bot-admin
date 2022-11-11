import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import AccountEntity from './account.entity';
import CreateAccountDto from './dto/create-account.dto';
import GetAccountListDto from './dto/get-account-list.dto';
import UpdateAccountDto from './dto/update-account.dto';

@Injectable()
export class AccountRepository {
  constructor(
    @InjectRepository(AccountEntity) private model: Repository<AccountEntity>,
  ) {}

  async save(dto: CreateAccountDto) {
    const account = await this.model.findOne({
      where: { telegramUserId: dto.telegramUserId },
    });

    if (!account) {
      return this.model.save(dto);
    }

    return account;
  }

  updateById(id: number, dto: UpdateAccountDto) {
    return this.model.update(id, dto);
  }

  updateByTelegramId(id: number, dto: UpdateAccountDto) {
    return this.model.update({ telegramUserId: id }, dto);
  }

  deleteById(id: number) {
    return this.model.delete(id);
  }

  find(query: GetAccountListDto) {
    const where: DeepPartial<AccountEntity> = {};

    if (query.country) {
      where.country = query.country;
    }
    if (query.gender) {
      where.gender = query.gender;
    }

    return this.model.find({ skip: query.skip, take: query.take });
  }

  findById(id: number) {
    return this.model.findOne({ where: { id } });
  }

  findByTelegramId(id: number) {
    return this.model.findOne({ where: { telegramUserId: id } });
  }

  count() {
    return this.model.count();
  }
}
