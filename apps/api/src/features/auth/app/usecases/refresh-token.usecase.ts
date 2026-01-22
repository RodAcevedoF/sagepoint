import { Injectable, Inject } from '@nestjs/common';
import type { IUserService } from '@/features/user/domain/inbound/user.service';
import { USER_SERVICE } from '@/features/user/domain/inbound/user.service';
import type { ITokenStore } from '@/features/auth/domain/outbound/token-store.port';
import { TOKEN_STORE } from '@/features/auth/domain/outbound/token-store.port';
import type { ITokenService } from '@/features/auth/domain/outbound/token-service.port';
import { TOKEN_SERVICE } from '@/features/auth/domain/outbound/token-service.port';
import type { LoginResult } from '@/features/auth/domain/inbound/auth.service.port';
import { LoginUseCase, type TokenPayload } from './login.usecase';

export class InvalidRefreshTokenError extends Error {
  constructor() {
    super('Invalid refresh token');
    this.name = 'InvalidRefreshTokenError';
  }
}

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    @Inject(USER_SERVICE) private readonly userService: IUserService,
    @Inject(TOKEN_STORE) private readonly tokenStore: ITokenStore,
    @Inject(TOKEN_SERVICE) private readonly tokenService: ITokenService,
    private readonly loginUseCase: LoginUseCase,
  ) {}

  async execute(refreshToken: string): Promise<LoginResult> {
    let payload: TokenPayload;
    try {
      payload = this.tokenService.verifyRefreshToken(refreshToken);
    } catch {
      throw new InvalidRefreshTokenError();
    }

    const userId = payload.sub;
    const storedToken = await this.tokenStore.getRefreshToken(userId);

    if (!storedToken || storedToken !== refreshToken) {
      throw new InvalidRefreshTokenError();
    }

    const user = await this.userService.get(userId);
    if (!user) {
      throw new InvalidRefreshTokenError();
    }

    return this.loginUseCase.execute(user);
  }
}
