import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/services/users.service';
import * as bcrypt from 'bcrypt';
import { RegisterResponse } from '../types/register-response.types';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(email: string, password: string): Promise<RegisterResponse> {
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await this.usersService.create(email, hashedPassword);
    return this.signToken(user.id, user.email);
  }

  async login(email: string, password: string): Promise<RegisterResponse> {
    const user = await this.usersService.findByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.signToken(user.id, user.email);
  }

  private signToken(userId: string, email: string): { access_token: string } {
    const payload = { sub: userId, email };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
