import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Gender } from '../account.entity';

export default class GetAccountListDto {
  @IsNotEmpty()
  skip: number;

  @IsNotEmpty()
  take: number;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsString()
  country?: string;
}
