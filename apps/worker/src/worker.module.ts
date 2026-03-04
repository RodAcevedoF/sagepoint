import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bullmq';
import { LoggerModule } from 'nestjs-pino';
import { DocumentProcessorService } from './document-processor/document-processor.service';
import { RoadmapProcessorService } from './roadmap-processor/roadmap-processor.service';

import { ConfigModule } from '@nestjs/config';
import { Neo4jModule } from '@sagepoint/graph';
import { AiModule, PerplexityResearchAdapter } from '@sagepoint/ai';

import { GCSStorage } from '@sagepoint/storage';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import type { ICacheService } from '@sagepoint/domain';
import { CachedResourceDiscoveryAdapter } from './infra/cached-resource-discovery.adapter';

function createRedisCacheService(keyPrefix: string): ICacheService {
  const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    keyPrefix,
  });

  return {
    async get<T>(key: string): Promise<T | null> {
      const raw = await redis.get(key);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    },
    async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
      await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    },
    async del(key: string): Promise<void> {
      await redis.del(key);
    },
    async delByPattern(pattern: string): Promise<void> {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) await redis.del(...keys);
    },
  };
}

const isDev = process.env.NODE_ENV !== 'production';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: isDev ? 'debug' : 'info',
        ...(isDev && {
          transport: {
            target: 'pino-pretty',
            options: { colorize: true, singleLine: true },
          },
        }),
      },
    }),
    Neo4jModule,
    AiModule,
    ScheduleModule.forRoot(),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    }),
    BullModule.registerQueue({
      name: 'document-processing',
    }),
    BullModule.registerQueue({
      name: 'roadmap-generation',
    }),
  ],
  providers: [
    DocumentProcessorService,
    RoadmapProcessorService,
    {
      provide: 'FILE_STORAGE',
      useFactory: (configService: ConfigService) => {
        // TODO: Consider adding local/supabase fallbacks if needed for dev
        return new GCSStorage({
          projectId: configService.getOrThrow<string>('GCP_PROJECT_ID'),
          bucketName: configService.getOrThrow<string>('GCS_BUCKET_NAME'),
          keyFilename: configService.get<string>('GCP_KEY_FILE'),
        });
      },
      inject: [ConfigService],
    },
    {
      provide: 'WORKER_CACHE',
      useFactory: () => createRedisCacheService('cache:'),
    },
    {
      provide: 'INNER_RESOURCE_DISCOVERY',
      useExisting: PerplexityResearchAdapter,
    },
    {
      provide: CachedResourceDiscoveryAdapter,
      useFactory: (inner: PerplexityResearchAdapter, cache: ICacheService) =>
        new CachedResourceDiscoveryAdapter(inner, cache),
      inject: ['INNER_RESOURCE_DISCOVERY', 'WORKER_CACHE'],
    },
  ],
})
export class WorkerModule {}
