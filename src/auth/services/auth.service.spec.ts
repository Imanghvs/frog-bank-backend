/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../../users/services/users.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  hash: jest.fn(() => Promise.resolve('hashed123')),
  compare: jest.fn(() => Promise.resolve(true)),
}));

describe('AuthService', () => {
  let service: AuthService;
  let usersService: Partial<Record<keyof UsersService, jest.Mock>>;
  let jwtService: Partial<Record<keyof JwtService, jest.Mock>>;

  const mockUser = {
    id: 'user-1',
    email: 'user@example.com',
    password: 'hashedpassword',
  };

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn(),
      create: jest.fn(),
    };

    jwtService = {
      sign: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should hash the password and create a user, then return a token', async () => {
      const email = 'test@example.com';
      const password = 'testpass';
      const hashedPassword = 'hashed123';
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      usersService.create!.mockResolvedValue({
        ...mockUser,
        password: hashedPassword,
      });
      jwtService.sign!.mockReturnValue('access-token');

      const result = await service.register(email, password);

      expect(bcrypt.hash).toHaveBeenCalledWith(password, 12);
      expect(usersService.create).toHaveBeenCalledWith(email, hashedPassword);
      expect(result).toEqual({ access_token: 'access-token' });
    });
  });

  describe('login', () => {
    it('should validate password and return a token', async () => {
      usersService.findByEmail!.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.sign!.mockReturnValue('access-token');

      const result = await service.login(mockUser.email, 'plaintext-password');

      expect(usersService.findByEmail).toHaveBeenCalledWith(mockUser.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'plaintext-password',
        mockUser.password,
      );
      expect(result).toEqual({ access_token: 'access-token' });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      usersService.findByEmail!.mockResolvedValue(undefined);

      await expect(service.login('nope@example.com', 'pass')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      usersService.findByEmail!.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(mockUser.email, 'wrongpass')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('signToken (private)', () => {
    it('should generate a valid JWT payload', () => {
      const userId = '123';
      const email = 'a@b.com';
      jwtService.sign!.mockReturnValue('signed-token');

      // @ts-ignore: accessing private method
      const result = service['signToken'](userId, email);

      expect(jwtService.sign).toHaveBeenCalledWith({ sub: userId, email });
      expect(result).toEqual({ access_token: 'signed-token' });
    });
  });
});
