export const TOKEN_STORE = Symbol('TOKEN_STORE');

export interface ITokenStore {
  storeVerificationToken(
    userId: string,
    token: string,
    ttlSeconds: number,
  ): Promise<void>;
  getVerificationToken(token: string): Promise<string | null>;
  deleteVerificationToken(token: string): Promise<void>;

  storeRefreshToken(
    userId: string,
    token: string,
    ttlSeconds: number,
  ): Promise<void>;
  getRefreshToken(userId: string): Promise<string | null>;
  deleteRefreshToken(userId: string): Promise<void>;
}
