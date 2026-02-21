import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bullmq';
import { DocumentProcessorService } from './document-processor/document-processor.service';
import { RoadmapProcessorService } from './roadmap-processor/roadmap-processor.service';

import { ConfigModule } from '@nestjs/config';
import { Neo4jModule } from '@sagepoint/graph';
import { AiModule } from '@sagepoint/ai';

import { GCSStorage } from '@sagepoint/storage';
import { ConfigService } from '@nestjs/config';

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
    }
  ],
})
export class WorkerModule {}
