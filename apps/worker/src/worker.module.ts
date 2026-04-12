import { Module } from "@nestjs/common";
import { APP_FILTER } from "@nestjs/core";
import { SentryModule, SentryGlobalFilter } from "@sentry/nestjs/setup";
import { ScheduleModule } from "@nestjs/schedule";
import { BullModule } from "@nestjs/bullmq";
import { LoggerModule } from "nestjs-pino";
import { DocumentProcessorService } from "./document-processor/document-processor.service";
import { RoadmapProcessorService } from "./roadmap-processor/roadmap-processor.service";
import { InsightsRefreshService } from "./insights-refresh/insights-refresh.service";
import {
  TavilyNewsAdapter,
  CachedResourceDiscoveryAdapter,
  PerplexityResearchAdapter,
} from "@sagepoint/ai";

import { ConfigModule } from "@nestjs/config";
import {
  Neo4jModule,
  Neo4jService,
  Neo4jConceptRepository,
} from "@sagepoint/graph";
import { AiModule } from "@sagepoint/ai";

import { GCSStorage } from "@sagepoint/storage";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";
import {
  CATEGORY_REPOSITORY,
  CONCEPT_REPOSITORY,
  FILE_STORAGE,
  NEWS_ARTICLE_REPOSITORY,
  NEWS_SERVICE,
  RESOURCE_DISCOVERY_SERVICE,
  DOCUMENT_REPOSITORY,
  DOCUMENT_SUMMARY_REPOSITORY,
  QUIZ_REPOSITORY,
  QUESTION_REPOSITORY,
  ROADMAP_REPOSITORY,
  RESOURCE_REPOSITORY,
} from "@sagepoint/domain";
import type { ICacheService, INewsService } from "@sagepoint/domain";
import {
  PrismaClient,
  PrismaPg,
  PrismaCategoryRepository,
  PrismaNewsArticleRepository,
  PrismaDocumentRepository,
  PrismaDocumentSummaryRepository,
  PrismaQuizRepository,
  PrismaQuestionRepository,
  PrismaRoadmapRepository,
  PrismaResourceRepository,
} from "@sagepoint/database";

function createWorkerPrisma(): PrismaClient {
  return new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
  });
}

function createRedisCacheService(keyPrefix: string): ICacheService {
  const redis = new Redis({
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
    db: parseInt(process.env.REDIS_DB || "0"),
    keyPrefix,
  });

  return {
    async get<T>(key: string): Promise<T | null> {
      const raw = await redis.get(key);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    },
    async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
      await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
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

const isDev = process.env.NODE_ENV !== "production";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: "../../.env" }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: isDev ? "debug" : "info",
        ...(isDev && {
          transport: {
            target: "pino-pretty",
            options: { colorize: true, singleLine: true },
          },
        }),
      },
    }),
    SentryModule.forRoot(),
    Neo4jModule,
    AiModule,
    ScheduleModule.forRoot(),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || "localhost",
        port: parseInt(process.env.REDIS_PORT || "6379"),
        db: parseInt(process.env.REDIS_DB || "0"),
      },
    }),
    BullModule.registerQueue({
      name: "document-processing",
    }),
    BullModule.registerQueue({
      name: "roadmap-generation",
    }),
  ],
  providers: [
    { provide: APP_FILTER, useClass: SentryGlobalFilter },
    DocumentProcessorService,
    RoadmapProcessorService,
    InsightsRefreshService,
    {
      provide: FILE_STORAGE,
      useFactory: (configService: ConfigService) => {
        return new GCSStorage({
          projectId: configService.getOrThrow<string>("GCP_PROJECT_ID"),
          bucketName: configService.getOrThrow<string>("GCS_BUCKET_NAME"),
          keyFilename: configService.get<string>("GCP_KEY_FILE"),
        });
      },
      inject: [ConfigService],
    },
    {
      provide: "WORKER_CACHE",
      useFactory: () => createRedisCacheService("cache:"),
    },
    {
      provide: RESOURCE_DISCOVERY_SERVICE,
      useFactory: (config: ConfigService, cache: ICacheService) => {
        const inner = new PerplexityResearchAdapter({
          apiKey: config.get<string>("PERPLEXITY_API_KEY") ?? "",
        });
        return new CachedResourceDiscoveryAdapter(inner, cache);
      },
      inject: [ConfigService, "WORKER_CACHE"],
    },
    {
      provide: "WORKER_PRISMA",
      useFactory: () => createWorkerPrisma(),
    },
    {
      provide: CATEGORY_REPOSITORY,
      useFactory: (prisma: PrismaClient) =>
        new PrismaCategoryRepository(prisma),
      inject: ["WORKER_PRISMA"],
    },
    {
      provide: NEWS_ARTICLE_REPOSITORY,
      useFactory: (prisma: PrismaClient) =>
        new PrismaNewsArticleRepository(prisma),
      inject: ["WORKER_PRISMA"],
    },
    {
      provide: DOCUMENT_REPOSITORY,
      useFactory: (prisma: PrismaClient) =>
        new PrismaDocumentRepository(prisma),
      inject: ["WORKER_PRISMA"],
    },
    {
      provide: DOCUMENT_SUMMARY_REPOSITORY,
      useFactory: (prisma: PrismaClient) =>
        new PrismaDocumentSummaryRepository(prisma),
      inject: ["WORKER_PRISMA"],
    },
    {
      provide: QUIZ_REPOSITORY,
      useFactory: (prisma: PrismaClient) => new PrismaQuizRepository(prisma),
      inject: ["WORKER_PRISMA"],
    },
    {
      provide: QUESTION_REPOSITORY,
      useFactory: (prisma: PrismaClient) =>
        new PrismaQuestionRepository(prisma),
      inject: ["WORKER_PRISMA"],
    },
    {
      provide: ROADMAP_REPOSITORY,
      useFactory: (prisma: PrismaClient) => new PrismaRoadmapRepository(prisma),
      inject: ["WORKER_PRISMA"],
    },
    {
      provide: RESOURCE_REPOSITORY,
      useFactory: (prisma: PrismaClient) =>
        new PrismaResourceRepository(prisma),
      inject: ["WORKER_PRISMA"],
    },
    {
      provide: NEWS_SERVICE,
      useFactory: (configService: ConfigService): INewsService =>
        new TavilyNewsAdapter({
          apiKey: configService.get<string>("TAVILY_API_KEY") ?? "",
        }),
      inject: [ConfigService],
    },
    {
      provide: CONCEPT_REPOSITORY,
      useFactory: (neo4jService: Neo4jService) =>
        new Neo4jConceptRepository(neo4jService),
      inject: [Neo4jService],
    },
  ],
})
export class WorkerModule {}
