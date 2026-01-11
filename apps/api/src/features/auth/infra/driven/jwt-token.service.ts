import * as jwt from 'jsonwebtoken';
import type { TokenGenerator, TokenPayload } from '@/features/auth/app/usecases/login.usecase';
import type { TokenVerifier } from '@/features/auth/app/usecases/refresh-token.usecase';

export interface JwtConfig {
  accessSecret: string;
  refreshSecret: string;
  accessExpiresIn: string;
  refreshExpiresIn: string;
}

export class JwtTokenService implements TokenGenerator, TokenVerifier {
  constructor(private readonly config: JwtConfig) {}

  signAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.config.accessSecret, {
      expiresIn: this.config.accessExpiresIn as jwt.SignOptions['expiresIn'],
    });
  }

  signRefreshToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.config.refreshSecret, {
      expiresIn: this.config.refreshExpiresIn as jwt.SignOptions['expiresIn'],
    });
  }

  verifyRefreshToken(token: string): TokenPayload {
    return jwt.verify(token, this.config.refreshSecret) as TokenPayload;
  }
}
