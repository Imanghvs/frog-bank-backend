import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from '../services/auth.service';
import { RegisterDto } from '../dtos/register.dto';
import { LoginDto } from '../dtos/login.dto';

describe('AuthController', () => {
  let authController: AuthController;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    authController = moduleRef.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register and return access token', async () => {
      const dto: RegisterDto = {
        email: 'test@example.com',
        password: 'securepass',
      };
      const token = { access_token: 'jwt-token' };

      mockAuthService.register.mockResolvedValue(token);

      const result = await authController.register(dto);

      expect(result).toEqual(token);
      expect(mockAuthService.register).toHaveBeenCalledWith(
        dto.email,
        dto.password,
      );
    });
  });

  describe('login', () => {
    it('should login and return access token', async () => {
      const dto: LoginDto = {
        email: 'test@example.com',
        password: 'securepass',
      };
      const token = { access_token: 'jwt-token' };

      mockAuthService.login.mockResolvedValue(token);

      const result = await authController.login(dto);

      expect(result).toEqual(token);
      expect(mockAuthService.login).toHaveBeenCalledWith(
        dto.email,
        dto.password,
      );
    });
  });
});
