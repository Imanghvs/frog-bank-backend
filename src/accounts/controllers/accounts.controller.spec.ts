import { Test, TestingModule } from '@nestjs/testing';
import { AccountsController } from './accounts.controller';
import { AccountsService } from '../services/accounts.service';
import { Account } from '../entities/account.entity';
import { User } from '../../users/entities/user.entity';

describe('AccountsController', () => {
  let controller: AccountsController;

  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    password: 'hashedpw',
    accounts: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAccounts: Account[] = [
    {
      id: '1',
      accountNumber: '1234567890',
      balance: 1000.0,
      owner: mockUser,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      accountNumber: '9876543210',
      balance: 500.0,
      owner: mockUser,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockAccountsService = {
    createAccount: jest.fn(),
    findByOwner: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountsController],
      providers: [
        {
          provide: AccountsService,
          useValue: mockAccountsService,
        },
      ],
    }).compile();

    controller = module.get<AccountsController>(AccountsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /accounts', () => {
    it('should call AccountsService.createAccount and return a new account', async () => {
      const newAccount: Account = {
        id: '3',
        accountNumber: '1122334455',
        balance: 0.0,
        owner: mockUser,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const serviceCreateAccountSpy = jest
        .spyOn(mockAccountsService, 'createAccount')
        .mockResolvedValue(newAccount);

      const req = { user: { id: mockUser.id } };

      const result = await controller.createAccount(req);

      expect(serviceCreateAccountSpy).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual(newAccount);
    });
  });

  describe('GET /accounts', () => {
    it('should return all accounts for the logged-in user', async () => {
      const serviceFindByOwnerSpy = jest
        .spyOn(mockAccountsService, 'findByOwner')
        .mockResolvedValue(mockAccounts);

      const req = { user: { id: mockUser.id } };

      const result = await controller.findMine(req);

      expect(serviceFindByOwnerSpy).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual(mockAccounts);
    });
  });
});
