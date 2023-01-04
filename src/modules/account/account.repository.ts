import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import AccountEntity, { AccountLVL } from './account.entity';
import CreateAccountDto from './dto/create-account.dto';
import GetAccountListDto from './dto/get-account-list.dto';
import UpdateAccountDto from './dto/update-account.dto';
import moment from 'moment';

@Injectable()
export class AccountRepository {
  constructor(
    @InjectRepository(AccountEntity) private model: Repository<AccountEntity>,
  ) {}

  async save(dto: CreateAccountDto) {
    const account = await this.model.findOne({
      where: { telegramUserId: dto.telegramUserId.toString() },
    });

    if (!account) {
      if (dto.invitedByReferralCode) {
        await this.applyReferralCode(dto?.invitedByReferralCode?.toString());
      }
      // TODO: remove after New YEAR Discount
      return this.model.save({
        ...dto,
        accountLVL: AccountLVL.PRIME,
        accountLVLExpiredAt: moment().add('3', 'days').toString(),
        invitedByReferralCode: dto?.invitedByReferralCode?.toString(),
        telegramUserId: dto.telegramUserId.toString(),
        referralCode: dto.telegramUserId.toString(),
      });
    }

    return account;
  }

  updateById(id: number, dto: UpdateAccountDto) {
    return this.model.update(id, {
      ...dto,
      invitedByReferralCode: dto?.invitedByReferralCode?.toString(),
      telegramUserId: dto.telegramUserId.toString(),
    });
  }

  updateByTelegramId(id: string, dto: UpdateAccountDto) {
    return this.model.update(
      { telegramUserId: id },
      {
        ...dto,
        invitedByReferralCode: dto?.invitedByReferralCode?.toString(),
        telegramUserId: dto.telegramUserId.toString(),
      },
    );
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

  findByTelegramId(id: string) {
    return this.model.findOne({ where: { telegramUserId: id } });
  }

  count() {
    return this.model.count();
  }

  async applyReferralCode(referralCode: string) {
    const acc = await this.model.findOne({ where: { referralCode } });

    if (acc) {
      await this.model.update(acc.id, { coins: acc.coins + 10 });
    }
  }
}
