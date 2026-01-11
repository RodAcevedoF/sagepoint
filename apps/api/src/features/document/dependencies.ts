import type { IDocumentService } from '@/features/document/domain/inbound/document.service';
import type { IDocumentRepository, IFileStorage, IDocumentProcessingQueue } from '@sagepoint/domain';
import { DocumentService } from '@/features/document/infra/driver/document.service';
import { InMemoryDocumentRepository } from '@/features/document/infra/driven/in-memory-document.repository';
import { UploadDocumentUseCase } from './app/usecases/upload-document.usecase';
import { GetDocumentUseCase } from './app/usecases/get-document.usecase';
import { BullMqDocumentProcessingQueue } from '@/core/infra/queue/bull-mq.queue';
import { Queue } from 'bullmq';

export interface DocumentDependencies {
  documentService: IDocumentService;
  documentRepository: IDocumentRepository;
}

import { PrismaService } from '@/core/infra/database/prisma.service';
import { PrismaDocumentRepository } from '@/features/document/infra/driven/prisma-document.repository';

// ... imports

export function makeDocumentDependencies(
  fileStorage: IFileStorage,
): DocumentDependencies {
  const prismaService = new PrismaService(); 
  const documentRepository = new PrismaDocumentRepository(prismaService);
  
  // Manually instantiate Queue for job dispatching (Producer)
  // We use the same connection settings as AppModule
  const queue = new Queue('document-processing', {
    connection: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
    },
  });
  const processingQueue = new BullMqDocumentProcessingQueue(queue);

  const uploadDocumentUseCase = new UploadDocumentUseCase(
    documentRepository,
    fileStorage,
    processingQueue
  );
  const getDocumentUseCase = new GetDocumentUseCase(documentRepository);

  const documentService = new DocumentService(
    uploadDocumentUseCase,
    getDocumentUseCase,
  );

  return {
    documentService,
    documentRepository,
  };
}
