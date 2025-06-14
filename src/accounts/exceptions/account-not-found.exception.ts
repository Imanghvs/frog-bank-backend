import { HttpException, HttpStatus } from '@nestjs/common';

export class AccountNotFoundException extends HttpException {
  constructor() {
    super(`Account not found`, HttpStatus.NOT_FOUND);
  }
}
