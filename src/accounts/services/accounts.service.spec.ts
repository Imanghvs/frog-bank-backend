/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { AccountsService } from './accounts.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Account } from '../entities/account.entity';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';

describe('AccountsService', () => {
  let service: AccountsService;
  let repo: jest.Mocked<Repository<Account>>;

  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    password: 'hashedpw',
    accounts: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAccount1: Account = {
    id: '1',
    accountNumber: '1234567890',
    balance: 0.0,
    owner: mockUser,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAccount2: Account = {
    id: '2',
    accountNumber: '1234567891',
    balance: 0.0,
    owner: mockUser,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountsService,
        {
          provide: getRepositoryToken(Account),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AccountsService>(AccountsService);
    repo = module.get(getRepositoryToken(Account));
  });

  it('should create a new account for a user', async () => {
    const repoCreateSpy = jest
      .spyOn(repo, 'create')
      .mockReturnValue(mockAccount1);
    const repoSaveSpy = jest
      .spyOn(repo, 'save')
      .mockResolvedValue(mockAccount1);

    const account = await service.createAccount(mockUser.id);

    expect(repoCreateSpy).toHaveBeenCalledWith({
      accountNumber: expect.anything(),
      balance: 0.0,
      owner: { id: mockUser.id },
    });
    expect(repoSaveSpy).toHaveBeenCalledWith(mockAccount1);
    expect(account).toEqual(mockAccount1);
  });

  it('should find account by ID', async () => {
    const repoFindOneSpy = jest
      .spyOn(repo, 'findOne')
      .mockResolvedValue(mockAccount1);

    const result = await service.findById(mockAccount1.id);
    expect(repoFindOneSpy).toHaveBeenCalledWith({
      where: { id: mockAccount1.id },
    });
    expect(result).toEqual(mockAccount1);
  });

  it('should find accounts by owner', async () => {
    const mockAccounts: Account[] = [mockAccount1, mockAccount2];
    const repoFindSpy = jest
      .spyOn(repo, 'find')
      .mockResolvedValue(mockAccounts);

    const result = await service.findByOwner(mockUser.id);
    expect(repoFindSpy).toHaveBeenCalledWith({
      where: { owner: { id: mockUser.id } },
    });
    expect(result).toEqual(mockAccounts);
  });
});
