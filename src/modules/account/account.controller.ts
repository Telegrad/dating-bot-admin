import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse } from '@nestjs/swagger';
import AccountEntity from './account.entity';
import { AccountService } from './account.service';
import CreateAccountDto from './dto/create-account.dto';
import GetAccountListDto from './dto/get-account-list.dto';
import UpdateAccountDto from './dto/update-account.dto';

@Controller('accounts')
export class AccountController {
  constructor(private service: AccountService) {}

  @ApiOkResponse({ type: AccountEntity })
  @Post()
  create(@Body() dto: CreateAccountDto) {
    return this.service.create(dto);
  }

  @ApiOkResponse()
  @Put(':id')
  updateById(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAccountDto,
  ) {
    return this.service.updateById(id, dto);
  }

  @ApiOkResponse()
  @ApiNotFoundResponse({ description: 'Account with such id not found' })
  @Delete(':id')
  deleteById(@Param('id', ParseIntPipe) id: number) {
    return this.service.deleteById(id);
  }

  @ApiOkResponse({ type: AccountEntity })
  @ApiNotFoundResponse({ description: 'Account with such id not found' })
  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.service.getById(id);
  }

  @ApiOkResponse({ type: AccountEntity, isArray: true })
  @Get()
  getList(@Query() query: GetAccountListDto) {
    return this.service.getList(query);
  }

  @ApiOkResponse({ type: Number })
  @Get('count')
  getCount() {
    return this.service.countAccounts();
  }
}
