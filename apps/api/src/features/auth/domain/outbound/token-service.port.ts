import { TokenPayload } from '@sagepoint/domain';

export const TOKEN_SERVICE = Symbol('TOKEN_SERVICE');

export interface ITokenService {
  signAccessToken(payload: TokenPayload): string;
  signRefreshToken(payload: TokenPayload): string;
  verifyRefreshToken(token: string): TokenPayload;
}
