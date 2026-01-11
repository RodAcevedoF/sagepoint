import type { ITokenStore } from '@/features/auth/domain/outbound/token-store.port';
import { User } from '@sagepoint/domain';

export interface TokenPayload {
  sub: string;
  email: string;
  role: string;
}

export interface TokenGenerator {
  signAccessToken(payload: TokenPayload): string;
  signRefreshToken(payload: TokenPayload): string;
}

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export class LoginUseCase {
  private static readonly REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60; // 7 days

  constructor(
    private readonly tokenStore: ITokenStore,
    private readonly tokenGenerator: TokenGenerator,
  ) {}

  async execute(user: User): Promise<LoginResult> {
    const payload: TokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.tokenGenerator.signAccessToken(payload);
    const refreshToken = this.tokenGenerator.signRefreshToken(payload);

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
