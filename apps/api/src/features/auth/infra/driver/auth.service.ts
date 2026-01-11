import { User } from '@sagepoint/domain';
import type { IAuthService, RegisterInput, LoginResult } from '@/features/auth/domain/inbound/auth.service.port';
import { RegisterUseCase } from '@/features/auth/app/usecases/register.usecase';
import { VerifyEmailUseCase } from '@/features/auth/app/usecases/verify-email.usecase';
import { LoginUseCase } from '@/features/auth/app/usecases/login.usecase';
import { LogoutUseCase } from '@/features/auth/app/usecases/logout.usecase';
import { RefreshTokenUseCase } from '@/features/auth/app/usecases/refresh-token.usecase';
import { ValidateUserUseCase } from '@/features/auth/app/usecases/validate-user.usecase';
import { ValidateGoogleUserUseCase, type GoogleUserDetails } from '@/features/auth/app/usecases/validate-google-user.usecase';

export class AuthService implements IAuthService {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly verifyEmailUseCase: VerifyEmailUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly validateUserUseCase: ValidateUserUseCase,
    private readonly validateGoogleUserUseCase: ValidateGoogleUserUseCase,
  ) {}

  async register(input: RegisterInput): Promise<{ message: string }> {
    return this.registerUseCase.execute(input);
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    return this.verifyEmailUseCase.execute(token);
  }

  async login(user: User): Promise<LoginResult> {
    return this.loginUseCase.execute(user);
  }

  async logout(userId: string): Promise<void> {
    return this.logoutUseCase.execute(userId);
  }

  async refresh(refreshToken: string): Promise<LoginResult> {
    return this.refreshTokenUseCase.execute(refreshToken);
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    return this.validateUserUseCase.execute(email, password);
  }

  async validateGoogleUser(details: GoogleUserDetails): Promise<User> {
    return this.validateGoogleUserUseCase.execute(details);
  }
}
