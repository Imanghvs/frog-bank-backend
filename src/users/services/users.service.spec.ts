import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User } from '../entities/user.entity';

type MockType<T> = {
  [P in keyof T]?: jest.Mock<any, any>;
};

const repositoryMockFactory = (): MockType<Repository<any>> => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
});

describe('UsersService', () => {
  let service: UsersService;
  let repositoryMock: MockType<Repository<User>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repositoryMock = module.get(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByEmail', () => {
    it('should return a user when found', async () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        password: 'hashed',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;

      repositoryMock.findOne!.mockResolvedValue(user);

      const result = await service.findByEmail('test@example.com');

      expect(repositoryMock.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(result).toEqual(user);
    });

    it('should return null when no user found', async () => {
      repositoryMock.findOne!.mockResolvedValue(null);

      const result = await service.findByEmail('notfound@example.com');

      expect(repositoryMock.findOne).toHaveBeenCalledWith({
        where: { email: 'notfound@example.com' },
      });
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create and save a new user', async () => {
      const email = 'new@example.com';
      const hashedPassword = 'hashedpassword';
      const createdUser = {
        id: '1',
        email,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;

      repositoryMock.create!.mockReturnValue(createdUser);
      repositoryMock.save!.mockResolvedValue(createdUser);

      const result = await service.create(email, hashedPassword);

      expect(repositoryMock.create).toHaveBeenCalledWith({
        email,
        password: hashedPassword,
      });
      expect(repositoryMock.save).toHaveBeenCalledWith(createdUser);
      expect(result).toEqual(createdUser);
    });
  });
});
