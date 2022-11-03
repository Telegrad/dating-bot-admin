import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Gender } from '../account.entity';
import { ApiProperty } from '@nestjs/swagger';

export default class CreateAccountDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  country: string;

  @ApiProperty({ enum: Gender })
  @IsNotEmpty()
  @IsEnum(Gender)
  gender: Gender;
}
