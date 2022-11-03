import CreateAccountDto from './create-account.dto';
import { PartialType } from '@nestjs/swagger';

export default class UpdateAccountDto extends PartialType(CreateAccountDto) {}
