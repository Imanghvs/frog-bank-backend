import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt.guard';
import { AccountsService } from '../services/accounts.service';
import { Account } from '../entities/account.entity';

@Controller('accounts')
@UseGuards(JwtAuthGuard)
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  async createAccount(@Req() req: { user: { id: string } }): Promise<Account> {
    return this.accountsService.createAccount(req.user.id);
  }

  @Get()
  async findMine(@Req() req: { user: { id: string } }): Promise<Account[]> {
    return this.accountsService.findByOwner(req.user.id);
  }
}
