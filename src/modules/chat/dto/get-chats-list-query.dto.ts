import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export default class GetChatsListQueryDto {
  @ApiProperty()
  @IsNotEmpty()
  skip: number;

  @ApiProperty()
  @IsNotEmpty()
  take: number;
}
