import { Module } from '@nestjs/common';
import { DOCUMENT_SERVICE } from '@/features/document/domain/inbound/document.service';
import { DOCUMENT_PROGRESS_SERVICE } from '@/features/document/domain/inbound/document-progress.service';
import { DocumentProgressServiceImpl } from '@/features/document/infra/services/document-progress.service';
import { DOCUMENT_REPOSITORY } from '@sagepoint/domain';
import { DocumentController } from '@/features/document/infra/driver/http/document.controller';
import { getDependencies } from '@/core/bootstrap';
import { QueueEvents } from 'bullmq';
import type { IDocumentService } from '@/features/document/domain/inbound/document.service';

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
            username: process.env.REDIS_USERNAME || undefined,
            password: process.env.REDIS_PASSWORD || undefined,
            port: parseInt(process.env.REDIS_PORT || '6379'),
            db: parseInt(process.env.REDIS_DB || '0'),
          },
        });
      },
    },
    {
      provide: DOCUMENT_PROGRESS_SERVICE,
      useFactory: (qe: QueueEvents, svc: IDocumentService) =>
        new DocumentProgressServiceImpl(qe, svc),
      inject: ['DOCUMENT_QUEUE_EVENTS', DOCUMENT_SERVICE],
    },
  ],
  exports: [DOCUMENT_SERVICE],
})
export class DocumentModule {}
