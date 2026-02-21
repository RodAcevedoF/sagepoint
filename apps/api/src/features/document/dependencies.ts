import type { IDocumentService } from '@/features/document/domain/inbound/document.service';
import type {
  IDocumentRepository,
  IDocumentSummaryRepository,
  IQuizRepository,
  IQuestionRepository,
  IQuizAttemptRepository,
  IFileStorage,
} from '@sagepoint/domain';
import { DocumentService } from '@/features/document/infra/driver/document.service';
import { UploadDocumentUseCase } from './app/usecases/upload-document.usecase';
import { GetDocumentUseCase } from './app/usecases/get-document.usecase';
import { GetUserDocumentsUseCase } from './app/usecases/get-user-documents.usecase';
import { GetDocumentSummaryUseCase } from './app/usecases/get-document-summary.usecase';
import { GetDocumentQuizUseCase } from './app/usecases/get-document-quiz.usecase';
import { GetQuizQuestionsUseCase } from './app/usecases/get-quiz-questions.usecase';
import { SubmitQuizAttemptUseCase } from './app/usecases/submit-quiz-attempt.usecase';
import { GetQuizAttemptsUseCase } from './app/usecases/get-quiz-attempts.usecase';
import { DeleteDocumentUseCase } from './app/usecases/delete-document.usecase';
import { BullMqDocumentProcessingQueue } from '@/core/infra/queue/bull-mq.queue';
import { Queue } from 'bullmq';
import { PrismaService } from '@/core/infra/database/prisma.service';
import { PrismaDocumentRepository } from '@/features/document/infra/driven/prisma-document.repository';
import { PrismaDocumentSummaryRepository } from '@/features/document/infra/driven/prisma-document-summary.repository';
import { PrismaQuizRepository } from '@/features/document/infra/driven/prisma-quiz.repository';
import { PrismaQuestionRepository } from '@/features/document/infra/driven/prisma-question.repository';
import { PrismaQuizAttemptRepository } from '@/features/document/infra/driven/prisma-quiz-attempt.repository';

export interface DocumentDependencies {
  documentService: IDocumentService;
  documentRepository: IDocumentRepository;
  documentSummaryRepository: IDocumentSummaryRepository;
  quizRepository: IQuizRepository;
  questionRepository: IQuestionRepository;
  quizAttemptRepository: IQuizAttemptRepository;
}

export function makeDocumentDependencies(
  fileStorage: IFileStorage,
): DocumentDependencies {
  const prismaService = new PrismaService();
  const documentRepository = new PrismaDocumentRepository(prismaService);
  const documentSummaryRepository = new PrismaDocumentSummaryRepository(
    prismaService,
  );
  const quizRepository = new PrismaQuizRepository(prismaService);
  const questionRepository = new PrismaQuestionRepository(prismaService);
  const quizAttemptRepository = new PrismaQuizAttemptRepository(prismaService);

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
    processingQueue,
  );
  const getDocumentUseCase = new GetDocumentUseCase(documentRepository);
  const getUserDocumentsUseCase = new GetUserDocumentsUseCase(
    documentRepository,
  );
  const getDocumentSummaryUseCase = new GetDocumentSummaryUseCase(
    documentSummaryRepository,
  );
  const getDocumentQuizUseCase = new GetDocumentQuizUseCase(quizRepository);
  const getQuizQuestionsUseCase = new GetQuizQuestionsUseCase(
    quizRepository,
    questionRepository,
  );
  const submitQuizAttemptUseCase = new SubmitQuizAttemptUseCase(
    questionRepository,
    quizAttemptRepository,
  );
  const getQuizAttemptsUseCase = new GetQuizAttemptsUseCase(
    quizAttemptRepository,
  );
  const deleteDocumentUseCase = new DeleteDocumentUseCase(
    documentRepository,
    fileStorage,
  );

  const documentService = new DocumentService(
    uploadDocumentUseCase,
    getDocumentUseCase,
    getUserDocumentsUseCase,
    getDocumentSummaryUseCase,
    getDocumentQuizUseCase,
    getQuizQuestionsUseCase,
    submitQuizAttemptUseCase,
    getQuizAttemptsUseCase,
    deleteDocumentUseCase,
  );

  return {
    documentService,
    documentRepository,
    documentSummaryRepository,
    quizRepository,
    questionRepository,
    quizAttemptRepository,
  };
}
