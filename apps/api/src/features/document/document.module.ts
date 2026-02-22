import { Module } from '@nestjs/common';
import { DOCUMENT_SERVICE } from '@/features/document/domain/inbound/document.service';
import { DOCUMENT_REPOSITORY } from '@sagepoint/domain';
import { DocumentController } from '@/features/document/infra/driver/http/document.controller';
import { getDependencies } from '@/core/bootstrap';
import { QueueEvents } from 'bullmq';

@Module({
  controllers: [DocumentController],
  providers: [
    {
      provide: DOCUMENT_SERVICE,
      useFactory: () => getDependencies().document.documentService,
    },
    {
      provide: DOCUMENT_REPOSITORY,
      useFactory: () => getDependencies().document.documentRepository,
    },
    {
      provide: 'DOCUMENT_QUEUE_EVENTS',
      useFactory: () => {
        return new QueueEvents('document-processing', {
          connection: {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379'),
          },
        });
      },
    },
  ],
  exports: [DOCUMENT_SERVICE],
})
export class DocumentModule {}
