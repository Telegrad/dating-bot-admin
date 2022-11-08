import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { Gender } from '../account.entity';
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
}
