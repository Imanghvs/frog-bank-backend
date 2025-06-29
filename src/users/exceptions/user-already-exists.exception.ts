import { HttpException } from '@nestjs/common';

export class UserAlreadyExistsException extends HttpException {
  constructor() {
    super('User with this email already exists', 409);
  }
}
