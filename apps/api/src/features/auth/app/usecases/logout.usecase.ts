import { Injectable, Inject } from '@nestjs/common';
import type { ITokenStore } from '@/features/auth/domain/outbound/token-store.port';
import { TOKEN_STORE } from '@/features/auth/domain/outbound/token-store.port';

@Injectable()
export class LogoutUseCase {
  constructor(@Inject(TOKEN_STORE) private readonly tokenStore: ITokenStore) {}

  async execute(userId: string): Promise<void> {
    await this.tokenStore.deleteRefreshToken(userId);
  }
}
