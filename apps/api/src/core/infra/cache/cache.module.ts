import { Global, Module } from '@nestjs/common';
import Redis from 'ioredis';
import { RedisCacheService } from './redis-cache.service';

@Global()
@Module({
  providers: [
    {
      provide: 'CACHE_REDIS_CLIENT',
      useFactory: () => {
        return new Redis({
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379'),
          db: parseInt(process.env.REDIS_DB || '0'),
          keyPrefix: 'cache:',
        });
      },
    },
    RedisCacheService,
  ],
  exports: [RedisCacheService],
})
export class CacheModule {}
