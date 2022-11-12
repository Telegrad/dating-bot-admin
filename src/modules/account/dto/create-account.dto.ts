import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { AccountLVL, Gender } from '../account.entity';
import { ApiProperty } from '@nestjs/swagger';

export default class CreateAccountDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  country: string;

  @ApiProperty({ enum: Gender })
  @IsOptional()
  @IsEnum(Gender)
  gender: Gender;

  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  telegramUserId: number;

  @ApiProperty()
  @IsOptional()
  accountLVL: AccountLVL;

  @ApiProperty()
  @IsOptional()
  coins?: number;

  @ApiProperty()
  @IsOptional()
  accountLVLExpiredAt?: string;

  @ApiProperty()
  @IsOptional()
  invitedByReferralCode?: number;
}
