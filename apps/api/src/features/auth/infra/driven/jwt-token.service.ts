import { Injectable, Inject } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import type { ITokenService } from '@/features/auth/domain/outbound/token-service.port';
import type { TokenPayload } from '@sagepoint/domain';

export interface JwtConfig {
  accessSecret: string;
  refreshSecret: string;
  accessExpiresIn: string;
  refreshExpiresIn: string;
}

@Injectable()
export class JwtTokenService implements ITokenService {
  constructor(@Inject('JWT_CONFIG') private readonly config: JwtConfig) {}

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
