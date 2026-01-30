import { Injectable, Inject } from '@nestjs/common';
import type { ITokenStore } from '@/features/auth/domain/outbound/token-store.port';
import { TOKEN_STORE } from '@/features/auth/domain/outbound/token-store.port';
import type { ITokenService } from '@/features/auth/domain/outbound/token-service.port';
import { TOKEN_SERVICE } from '@/features/auth/domain/outbound/token-service.port';
import { User, LoginResult, TokenPayload } from '@sagepoint/domain';

@Injectable()
export class LoginUseCase {
  private static readonly REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60; // 7 days

  constructor(
    @Inject(TOKEN_STORE) private readonly tokenStore: ITokenStore,
    @Inject(TOKEN_SERVICE) private readonly tokenService: ITokenService,
  ) {}

  async execute(user: User): Promise<LoginResult> {
    const payload: TokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.tokenService.signAccessToken(payload);
    const refreshToken = this.tokenService.signRefreshToken(payload);

    await this.tokenStore.storeRefreshToken(
      user.id,
      refreshToken,
      LoginUseCase.REFRESH_TOKEN_TTL,
    );

    return {
      accessToken,
      refreshToken,
      user,
    };
  }
}
