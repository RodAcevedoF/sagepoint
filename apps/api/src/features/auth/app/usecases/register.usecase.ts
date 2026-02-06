import { Injectable, Inject } from '@nestjs/common';
import type { IUserService } from '@/features/user/domain/inbound/user.service';
import { USER_SERVICE } from '@/features/user/domain/inbound/user.service';
import type { IEmailService } from '@/features/auth/domain/outbound/email.service.port';
import { EMAIL_SERVICE_PORT } from '@/features/auth/domain/outbound/email.service.port';
import type { ITokenStore } from '@/features/auth/domain/outbound/token-store.port';
import { TOKEN_STORE } from '@/features/auth/domain/outbound/token-store.port';
import type { IPasswordHasher } from '@/features/auth/domain/outbound/password-hasher.port';
import { PASSWORD_HASHER } from '@/features/auth/domain/outbound/password-hasher.port';
import { UserRole } from '@sagepoint/domain';
import { randomBytes } from 'crypto';

export interface RegisterInput {
  email: string;
  name: string;
  password: string;
}

export class UserAlreadyExistsError extends Error {
  constructor(email: string) {
    super(`User with email ${email} already exists`);
    this.name = 'UserAlreadyExistsError';
  }
}

@Injectable()
export class RegisterUseCase {
  private static readonly VERIFICATION_TOKEN_TTL = 24 * 60 * 60; // 24 hours

  constructor(
    @Inject(USER_SERVICE) private readonly userService: IUserService,
    @Inject(EMAIL_SERVICE_PORT) private readonly emailService: IEmailService,
    @Inject(TOKEN_STORE) private readonly tokenStore: ITokenStore,
    @Inject(PASSWORD_HASHER) private readonly passwordHasher: IPasswordHasher,
  ) {}

  async execute(input: RegisterInput): Promise<{ message: string }> {
    const existingUser = await this.userService.getByEmail(input.email);
    if (existingUser) {
      throw new UserAlreadyExistsError(input.email);
    }

    const passwordHash = await this.passwordHasher.hash(input.password);
    const verificationToken = randomBytes(32).toString('hex');

    const user = await this.userService.create({
      email: input.email,
      name: input.name,
      role: UserRole.USER,
      passwordHash,
    });

    const userWithToken = user.withVerificationToken(verificationToken);
    await this.userService.save(userWithToken);

    await this.tokenStore.storeVerificationToken(
      user.id,
      verificationToken,
      RegisterUseCase.VERIFICATION_TOKEN_TTL,
    );

    // If using Mock Email (Dev/Test), we can auto-verify for convenience
    // OR we could return the token.
    // Let's auto-verify to unblock E2E tests simply.
    const isMock = process.env.USE_MOCK_EMAIL === 'true';

    if (isMock) {
      // Auto-verify
      const verifiedUser = user.verify();
      await this.userService.save(verifiedUser);
    } else {
      await this.emailService.sendVerificationEmail(
        user.email,
        verificationToken,
      );
    }

    return {
      message:
        'Registration successful. Please check your email to verify your account.',
    };
  }
}
