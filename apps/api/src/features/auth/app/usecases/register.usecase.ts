import { Injectable, Inject, Optional } from '@nestjs/common';
import type { IUserService } from '@/features/user/domain/inbound/user.service';
import { USER_SERVICE } from '@/features/user/domain/inbound/user.service';
import type { IEmailService } from '@/features/auth/domain/outbound/email.service.port';
import { EMAIL_SERVICE_PORT } from '@/features/auth/domain/outbound/email.service.port';
import type { ITokenStore } from '@/features/auth/domain/outbound/token-store.port';
import { TOKEN_STORE } from '@/features/auth/domain/outbound/token-store.port';
import type { IPasswordHasher } from '@/features/auth/domain/outbound/password-hasher.port';
import { PASSWORD_HASHER } from '@/features/auth/domain/outbound/password-hasher.port';
import { ValidateInvitationTokenUseCase } from '@/features/invitation/app/usecases/validate-invitation-token.usecase';
import { AcceptInvitationUseCase } from '@/features/invitation/app/usecases/accept-invitation.usecase';
import { UserRole } from '@sagepoint/domain';
import { randomBytes } from 'crypto';

export interface RegisterInput {
  email: string;
  name: string;
  password: string;
  invitationToken?: string;
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
    @Optional()
    private readonly validateInvitationToken?: ValidateInvitationTokenUseCase,
    @Optional() private readonly acceptInvitation?: AcceptInvitationUseCase,
  ) {}

  async execute(input: RegisterInput): Promise<{ message: string }> {
    const existingUser = await this.userService.getByEmail(input.email);
    if (existingUser) {
      throw new UserAlreadyExistsError(input.email);
    }

    // Invitation flow: validate token, get assigned role
    let invitedRole: UserRole | undefined;
    if (input.invitationToken && this.validateInvitationToken) {
      const invitation = await this.validateInvitationToken.execute(
        input.invitationToken,
      );
      if (invitation.email.toLowerCase() !== input.email.toLowerCase()) {
        throw new UserAlreadyExistsError('Email does not match the invitation');
      }
      invitedRole = invitation.role as UserRole;
    }

    const passwordHash = await this.passwordHasher.hash(input.password);
    const user = await this.userService.create({
      email: input.email,
      name: input.name,
      role: invitedRole ?? UserRole.USER,
      passwordHash,
    });

    // Invited users are auto-verified
    if (input.invitationToken && this.acceptInvitation) {
      const verifiedUser = user.verify();
      await this.userService.save(verifiedUser);
      await this.acceptInvitation.execute(input.invitationToken, user.id);
      return { message: 'Registration successful. You can now sign in.' };
    }

    // Standard registration flow
    const verificationToken = randomBytes(32).toString('hex');
    const userWithToken = user.withVerificationToken(verificationToken);
    await this.userService.save(userWithToken);

    await this.tokenStore.storeVerificationToken(
      user.id,
      verificationToken,
      RegisterUseCase.VERIFICATION_TOKEN_TTL,
    );

    const isMock = process.env.USE_MOCK_EMAIL === 'true';
    if (isMock) {
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
