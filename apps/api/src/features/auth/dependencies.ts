import Redis from 'ioredis';
import type { IAuthService } from '@/features/auth/domain/inbound/auth.service.port';
import type { ITokenStore } from '@/features/auth/domain/outbound/token-store.port';
import type { IPasswordHasher } from '@/features/auth/domain/outbound/password-hasher.port';
import type { IEmailService } from '@/features/auth/domain/outbound/email.service.port';
import type { IUserService } from '@/features/user/domain/inbound/user.service';
import { AuthService } from '@/features/auth/infra/driver/auth.service';
import { RedisTokenStore } from '@/features/auth/infra/driven/redis-token.store';
import { BcryptPasswordHasher } from '@/features/auth/infra/driven/bcrypt-password.hasher';
import { MockEmailService } from '@/features/auth/infra/driven/mock-email.service';
import { NodemailerEmailService } from '@/features/auth/infra/driven/nodemailer-email.service';
import { JwtTokenService } from '@/features/auth/infra/driven/jwt-token.service';
import { RegisterUseCase } from '@/features/auth/app/usecases/register.usecase';
import { VerifyEmailUseCase } from '@/features/auth/app/usecases/verify-email.usecase';
import { LoginUseCase } from '@/features/auth/app/usecases/login.usecase';
import { LogoutUseCase } from '@/features/auth/app/usecases/logout.usecase';
import { RefreshTokenUseCase } from '@/features/auth/app/usecases/refresh-token.usecase';
import { ValidateUserUseCase } from '@/features/auth/app/usecases/validate-user.usecase';
import { ValidateGoogleUserUseCase } from '@/features/auth/app/usecases/validate-google-user.usecase';

export interface AuthConfig {
  redis: {
    host: string;
    port: number;
  };
  jwt: {
    accessSecret: string;
    refreshSecret: string;
    accessExpiresIn: string;
    refreshExpiresIn: string;
  };
  email: {
    host: string;
    port: number;
    user: string;
    pass: string;
    frontendUrl: string;
  };
  useMockEmail: boolean;
}

export interface AuthDependencies {
  authService: IAuthService;
  tokenStore: ITokenStore;
  passwordHasher: IPasswordHasher;
  emailService: IEmailService;
  jwtTokenService: JwtTokenService;
}

export function makeAuthDependencies(
  config: AuthConfig,
  userService: IUserService,
): AuthDependencies {
  // Infrastructure adapters
  const redis = new Redis({
    host: config.redis.host,
    port: config.redis.port,
  });

  const tokenStore = new RedisTokenStore(redis);
  const passwordHasher = new BcryptPasswordHasher();

  const emailService = config.useMockEmail
    ? new MockEmailService()
    : new NodemailerEmailService(config.email);

  const jwtTokenService = new JwtTokenService(config.jwt);

  // Use cases
  const registerUseCase = new RegisterUseCase(
    userService,
    emailService,
    tokenStore,
    passwordHasher,
  );

  const verifyEmailUseCase = new VerifyEmailUseCase(userService, tokenStore);

  const loginUseCase = new LoginUseCase(tokenStore, jwtTokenService);

  const logoutUseCase = new LogoutUseCase(tokenStore);

  const refreshTokenUseCase = new RefreshTokenUseCase(
    userService,
    tokenStore,
    jwtTokenService,
    loginUseCase,
  );

  const validateUserUseCase = new ValidateUserUseCase(userService, passwordHasher);

  const validateGoogleUserUseCase = new ValidateGoogleUserUseCase(userService);

  // Service
  const authService = new AuthService(
    registerUseCase,
    verifyEmailUseCase,
    loginUseCase,
    logoutUseCase,
    refreshTokenUseCase,
    validateUserUseCase,
    validateGoogleUserUseCase,
  );

  return {
    authService,
    tokenStore,
    passwordHasher,
    emailService,
    jwtTokenService,
  };
}
