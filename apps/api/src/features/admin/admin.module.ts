import { Module } from '@nestjs/common';
import { Queue } from 'bullmq';
import { PrismaService } from '@/core/infra/database/prisma.service';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

const redisConnection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
};

@Module({
  controllers: [AdminController],
  providers: [
    PrismaService,
    AdminService,
    {
      provide: 'DOCUMENT_QUEUE',
      useFactory: () =>
        new Queue('document-processing', { connection: redisConnection }),
    },
    {
      provide: 'ROADMAP_QUEUE',
      useFactory: () =>
        new Queue('roadmap-generation', { connection: redisConnection }),
    },
  ],
})
export class AdminModule {}
