import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bullmq';
import { DocumentProcessorService } from './document-processor/document-processor.service';

import { ConfigModule } from '@nestjs/config';
import { Neo4jModule } from '@sagepoint/graph';
import { AiModule } from '@sagepoint/ai';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
  ],
  providers: [DocumentProcessorService],
})
export class WorkerModule {}
