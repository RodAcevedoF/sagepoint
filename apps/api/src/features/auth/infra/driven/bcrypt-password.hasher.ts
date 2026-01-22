import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import type { IPasswordHasher } from '@/features/auth/domain/outbound/password-hasher.port';

@Injectable()
export class BcryptPasswordHasher implements IPasswordHasher {
  private static readonly SALT_ROUNDS = 10;

  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, BcryptPasswordHasher.SALT_ROUNDS);
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
