import type { IUserService } from '@/features/user/domain/inbound/user.service';
import type { IPasswordHasher } from '@/features/auth/domain/outbound/password-hasher.port';
import { User } from '@sagepoint/domain';

export class EmailNotVerifiedError extends Error {
  constructor() {
    super('Email not verified');
    this.name = 'EmailNotVerifiedError';
  }
}

export class ValidateUserUseCase {
  constructor(
    private readonly userService: IUserService,
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  async execute(email: string, password: string): Promise<User | null> {
    const user = await this.userService.getByEmail(email);
    if (!user) {
      return null;
    }

    if (!user.passwordHash) {
      return null;
    }

    const isPasswordValid = await this.passwordHasher.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return null;
    }

    if (!user.isVerified) {
      throw new EmailNotVerifiedError();
    }

    return user;
  }
}
