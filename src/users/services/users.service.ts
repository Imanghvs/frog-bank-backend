import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserAlreadyExistsException } from '../exceptions/user-already-exists.exception';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async create(email: string, hashedPassword: string): Promise<User> {
    try {
      const userData = this.usersRepository.create({
        email,
        password: hashedPassword,
      });
      const user = await this.usersRepository.save(userData);
      return user;
    } catch (error) {
      if ('code' in error && (error as { code?: string })?.code === '23505') {
        // Unique constraint violation
        throw new UserAlreadyExistsException();
      }
      throw error;
    }
  }
}
