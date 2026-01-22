import { Injectable, Inject } from '@nestjs/common';
import type { IUserService } from '@/features/user/domain/inbound/user.service';
import { USER_SERVICE } from '@/features/user/domain/inbound/user.service';
import type { ITokenStore } from '@/features/auth/domain/outbound/token-store.port';
import { TOKEN_STORE } from '@/features/auth/domain/outbound/token-store.port';

export class InvalidVerificationTokenError extends Error {
  constructor() {
    super('Invalid or expired verification token');
    this.name = 'InvalidVerificationTokenError';
  }
}

export class UserNotFoundError extends Error {
  constructor() {
    super('User not found');
    this.name = 'UserNotFoundError';
  }
}

@Injectable()
export class VerifyEmailUseCase {
  constructor(
    @Inject(USER_SERVICE) private readonly userService: IUserService,
    @Inject(TOKEN_STORE) private readonly tokenStore: ITokenStore,
  ) {}

  async execute(token: string): Promise<{ message: string }> {
    const userId = await this.tokenStore.getVerificationToken(token);
    if (!userId) {
      throw new InvalidVerificationTokenError();
    }

    const user = await this.userService.get(userId);
    if (!user) {
      throw new UserNotFoundError();
    }

    if (user.isVerified) {
      return { message: 'Email already verified' };
    }

    const verifiedUser = user.verify();
    await this.userService.save(verifiedUser);

    await this.tokenStore.deleteVerificationToken(token);

    return { message: 'Email verified successfully. You can now login.' };
  }
}
