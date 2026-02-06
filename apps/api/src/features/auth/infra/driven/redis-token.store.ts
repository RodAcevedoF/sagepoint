import { Injectable, Inject } from '@nestjs/common';
import Redis from 'ioredis';
import type { ITokenStore } from '@/features/auth/domain/outbound/token-store.port';

@Injectable()
export class RedisTokenStore implements ITokenStore {
  private static readonly VERIFY_PREFIX = 'verify:';
  private static readonly REFRESH_PREFIX = 'refresh:';

  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}

  async storeVerificationToken(
    userId: string,
    token: string,
    ttlSeconds: number,
  ): Promise<void> {
    await this.redis.set(
      `${RedisTokenStore.VERIFY_PREFIX}${token}`,
      userId,
      'EX',
      ttlSeconds,
    );
  }

  async getVerificationToken(token: string): Promise<string | null> {
    return this.redis.get(`${RedisTokenStore.VERIFY_PREFIX}${token}`);
  }

  async deleteVerificationToken(token: string): Promise<void> {
    await this.redis.del(`${RedisTokenStore.VERIFY_PREFIX}${token}`);
  }

  async storeRefreshToken(
    userId: string,
    token: string,
    ttlSeconds: number,
  ): Promise<void> {
    await this.redis.set(
      `${RedisTokenStore.REFRESH_PREFIX}${userId}`,
      token,
      'EX',
      ttlSeconds,
    );
  }

  async getRefreshToken(userId: string): Promise<string | null> {
    return this.redis.get(`${RedisTokenStore.REFRESH_PREFIX}${userId}`);
  }

  async deleteRefreshToken(userId: string): Promise<void> {
    await this.redis.del(`${RedisTokenStore.REFRESH_PREFIX}${userId}`);
  }
}
