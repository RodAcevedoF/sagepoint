import { Module, Global } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import Redis from 'ioredis';
import { AUTH_SERVICE } from '@/features/auth/domain/inbound/auth.service.port';
import { TOKEN_STORE } from '@/features/auth/domain/outbound/token-store.port';
import { PASSWORD_HASHER } from '@/features/auth/domain/outbound/password-hasher.port';
import { EMAIL_SERVICE_PORT } from '@/features/auth/domain/outbound/email.service.port';
import { TOKEN_SERVICE } from '@/features/auth/domain/outbound/token-service.port';
import { AuthService } from '@/features/auth/infra/driver/auth.service';
import { AuthController } from '@/features/auth/infra/driver/http/auth.controller';
import { RedisTokenStore } from '@/features/auth/infra/driven/redis-token.store';
import { BcryptPasswordHasher } from '@/features/auth/infra/driven/bcrypt-password.hasher';
import {
  NodemailerEmailService,
  EmailConfig,
} from '@/features/auth/infra/driven/nodemailer-email.service';
import { MockEmailService } from '@/features/auth/infra/driven/mock-email.service';
import {
  JwtTokenService,
  JwtConfig,
} from '@/features/auth/infra/driven/jwt-token.service';
import { RegisterUseCase } from '@/features/auth/app/usecases/register.usecase';
import { VerifyEmailUseCase } from '@/features/auth/app/usecases/verify-email.usecase';
import { LoginUseCase } from '@/features/auth/app/usecases/login.usecase';
import { LogoutUseCase } from '@/features/auth/app/usecases/logout.usecase';
import { RefreshTokenUseCase } from '@/features/auth/app/usecases/refresh-token.usecase';
import { ValidateUserUseCase } from '@/features/auth/app/usecases/validate-user.usecase';
import { ValidateGoogleUserUseCase } from '@/features/auth/app/usecases/validate-google-user.usecase';
import { JwtStrategy } from '@/features/auth/infra/strategies/jwt.strategy';
import { GoogleStrategy } from '@/features/auth/infra/strategies/google.strategy';
import { UserModule } from '@/features/user/user.module';

@Global()
@Module({
  imports: [UserModule, PassportModule],
  controllers: [AuthController],
  providers: [
    // Configuration Providers
    {
      provide: 'REDIS_CLIENT',
      useFactory: () => {
        return new Redis({
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379'),
        });
      },
    },
    {
      provide: 'JWT_CONFIG',
      useFactory: (): JwtConfig => ({
        accessSecret: process.env.JWT_SECRET || 'dev_secret',
        refreshSecret: process.env.JWT_REFRESH_SECRET || 'refresh_secret',
        accessExpiresIn: '15m',
        refreshExpiresIn: '7d',
      }),
    },
    {
      provide: 'EMAIL_CONFIG',
      useFactory: (): EmailConfig => ({
        host: process.env.SMTP_HOST || 'smtp.ethereal.email',
        port: parseInt(process.env.SMTP_PORT || '587'),
        user: process.env.SMTP_USER || 'user',
        pass: process.env.SMTP_PASS || 'pass',
        frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
      }),
    },
    {
      provide: 'GOOGLE_CONFIG',
      useFactory: () => ({
        clientID: process.env.GOOGLE_CLIENT_ID || 'mock_client_id',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'mock_client_secret',
        callbackURL:
          process.env.GOOGLE_CALLBACK_URL ||
          'http://localhost:3000/api/auth/google/callback',
      }),
    },

    // Infrastructure Adapters
    {
      provide: TOKEN_STORE,
      useClass: RedisTokenStore,
    },
    {
      provide: PASSWORD_HASHER,
      useClass: BcryptPasswordHasher,
    },
    {
      provide: EMAIL_SERVICE_PORT,
      useFactory: (config: EmailConfig) => {
        // Force mock email for debugging as per previous bootstrap logic
        const useMockEmail = true;
        return useMockEmail
          ? new MockEmailService()
          : new NodemailerEmailService(config);
      },
      inject: ['EMAIL_CONFIG'],
    },
    {
      provide: TOKEN_SERVICE,
      useClass: JwtTokenService,
    },

    // Use Cases
    RegisterUseCase,
    VerifyEmailUseCase,
    LoginUseCase,
    LogoutUseCase,
    RefreshTokenUseCase,
    ValidateUserUseCase,
    ValidateGoogleUserUseCase,

    // Service
    {
      provide: AUTH_SERVICE,
      useClass: AuthService,
    },

    // Strategies
    JwtStrategy,
    GoogleStrategy,
  ],
  exports: [AUTH_SERVICE, TOKEN_SERVICE, TOKEN_STORE],
})
export class AuthModule {}
