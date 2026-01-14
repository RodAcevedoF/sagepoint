import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bullmq';
import { DocumentProcessorService } from './document-processor/document-processor.service';

import { ConfigModule } from '@nestjs/config';
import { Neo4jModule } from '@sagepoint/graph';
import { AiModule } from '@sagepoint/ai';

import { LocalDiskStorage } from './infra/storage/local-disk.storage';
import { SupabaseStorage } from './infra/storage/supabase.storage';
import * as path from 'path';
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
  ],
  providers: [
    DocumentProcessorService,
    {
      provide: 'FILE_STORAGE',
      useFactory: (configService: ConfigService) => {
        const storageDriver = configService.get<string>('STORAGE_DRIVER', 'local');
        if (storageDriver === 'supabase') {
          return new SupabaseStorage(configService);
        } else {
          // Default to local. Worker must access same volume as API.
          // apps/worker is CWD. API uploads are in ../api/uploads
          const defaultUploadDir = path.resolve(process.cwd(), '../api/uploads');
          const uploadDir = configService.get<string>('UPLOAD_DIR', defaultUploadDir);
          console.log(`[Worker] Using Storage: LocalDisk (${uploadDir})`);
          return new LocalDiskStorage(uploadDir);
        }
      },
      inject: [ConfigService],
    }
  ],
})
export class WorkerModule {}
