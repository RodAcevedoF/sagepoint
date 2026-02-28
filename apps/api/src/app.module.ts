import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { randomUUID } from 'crypto';
import { RoadmapModule } from '@/features/roadmap/roadmap.module';
import { DocumentModule } from '@/features/document/document.module';
import { UserModule } from '@/features/user/user.module';
import { AuthModule } from '@/features/auth/auth.module';
import { StorageModule } from '@/features/storage/storage.module';
import { AdminModule } from '@/features/admin/admin.module';
import { HealthModule } from '@/features/health/health.module';
import { DomainExceptionFilter } from '@/core/filters/domain-exception.filter';

const isDev = process.env.NODE_ENV !== 'production';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: isDev ? 'debug' : 'info',
        genReqId: (req) =>
          (req.headers['x-request-id'] as string) ?? randomUUID(),
        customProps: (req) => {
          const r = req as unknown as { user?: { id?: string }; url?: string };
          return { userId: r.user?.id };
        },
        autoLogging: {
          ignore: (req) => {
            const r = req as unknown as { url?: string };
            return ['/health', '/favicon.ico'].includes(r.url ?? '');
          },
        },
        serializers: {
          req: (req: Record<string, unknown>) => ({
            method: req['method'],
            url: req['url'],
            id: req['id'],
          }),
          res: (res: Record<string, unknown>) => ({
            statusCode: res['statusCode'],
          }),
        },
        ...(isDev && {
          transport: {
            target: 'pino-pretty',
            options: { colorize: true, singleLine: true },
          },
        }),
      },
    }),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    }),
    RoadmapModule,
    DocumentModule,
    UserModule,
    AuthModule,
    StorageModule,
    AdminModule,
    HealthModule,
  ],
  providers: [{ provide: APP_FILTER, useClass: DomainExceptionFilter }],
})
export class AppModule {}
