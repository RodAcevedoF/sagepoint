import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AUTH_SERVICE } from '@/features/auth/domain/inbound/auth.service.port';
import { TOKEN_STORE } from '@/features/auth/domain/outbound/token-store.port';
import { AuthController } from '@/features/auth/infra/driver/http/auth.controller';
import { JwtStrategy } from '@/features/auth/strategies/jwt.strategy';
import { GoogleStrategy } from '@/features/auth/strategies/google.strategy';
import { UserModule } from '@/features/user/user.module';
import { getDependencies } from '@/core/bootstrap';

@Module({
  imports: [
    UserModule,
    PassportModule,
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: AUTH_SERVICE,
      useFactory: () => getDependencies().auth.authService,
    },
    {
      provide: TOKEN_STORE,
      useFactory: () => getDependencies().auth.tokenStore,
    },
    JwtStrategy,
    GoogleStrategy,
  ],
  exports: [AUTH_SERVICE],
})
export class AuthModule {}
