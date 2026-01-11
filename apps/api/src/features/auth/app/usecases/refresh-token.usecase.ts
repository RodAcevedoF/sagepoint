import type { IUserService } from '@/features/user/domain/inbound/user.service';
import type { ITokenStore } from '@/features/auth/domain/outbound/token-store.port';
import { LoginUseCase, type LoginResult, type TokenPayload } from './login.usecase';

export interface TokenVerifier {
  verifyRefreshToken(token: string): TokenPayload;
}

export class InvalidRefreshTokenError extends Error {
  constructor() {
    super('Invalid refresh token');
    this.name = 'InvalidRefreshTokenError';
  }
}

export class RefreshTokenUseCase {
  constructor(
    private readonly userService: IUserService,
    private readonly tokenStore: ITokenStore,
    private readonly tokenVerifier: TokenVerifier,
    private readonly loginUseCase: LoginUseCase,
  ) {}

  async execute(refreshToken: string): Promise<LoginResult> {
    let payload: TokenPayload;
    try {
      payload = this.tokenVerifier.verifyRefreshToken(refreshToken);
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
