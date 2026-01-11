import type { ITokenStore } from '@/features/auth/domain/outbound/token-store.port';

export class LogoutUseCase {
  constructor(private readonly tokenStore: ITokenStore) {}

  async execute(userId: string): Promise<void> {
    await this.tokenStore.deleteRefreshToken(userId);
  }
}
