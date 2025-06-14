import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from '../entities/account.entity';
import { Repository } from 'typeorm';
import { AccountNotFoundException } from '../exceptions/account-not-found.exception';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
  ) {}

  async createAccount(userId: string): Promise<Account> {
    const accountData = this.accountRepository.create({
      accountNumber: `ACC-${Date.now()}`,
      balance: 0.0,
      owner: { id: userId },
    });
    return this.accountRepository.save(accountData);
  }

  async findById(id: string): Promise<Account> {
    const account = await this.accountRepository.findOne({
      where: { id },
    });
    if (!account) {
      throw new AccountNotFoundException();
    }
    return account;
  }

  async findByOwner(userId: string): Promise<Account[]> {
    return this.accountRepository.find({
      where: { owner: { id: userId } },
    });
  }
}
