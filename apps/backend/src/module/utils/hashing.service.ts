import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class HashingService {
  private saltRounds = 10;

  hashPassword(password: string): string {
    return bcrypt.hashSync(password, this.saltRounds);
  }

  verifyPassword(password: string, hash: string): boolean {
    return bcrypt.compareSync(password, hash);
  }
}
