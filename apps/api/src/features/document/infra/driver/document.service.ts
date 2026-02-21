import { UploadDocumentUseCase } from '@/features/document/app/usecases/upload-document.usecase';
import { GetDocumentUseCase } from '@/features/document/app/usecases/get-document.usecase';
import { GetUserDocumentsUseCase } from '@/features/document/app/usecases/get-user-documents.usecase';
import { GetDocumentSummaryUseCase } from '@/features/document/app/usecases/get-document-summary.usecase';
import { GetDocumentQuizUseCase } from '@/features/document/app/usecases/get-document-quiz.usecase';
import { GetQuizQuestionsUseCase } from '@/features/document/app/usecases/get-quiz-questions.usecase';
import { SubmitQuizAttemptUseCase } from '@/features/document/app/usecases/submit-quiz-attempt.usecase';
import { GetQuizAttemptsUseCase } from '@/features/document/app/usecases/get-quiz-attempts.usecase';
import { DeleteDocumentUseCase } from '@/features/document/app/usecases/delete-document.usecase';
import type {
  Document,
  DocumentSummary,
  Quiz,
  QuizAttempt,
} from '@sagepoint/domain';
import type { QuizWithQuestions } from '@/features/document/app/usecases/get-quiz-questions.usecase';
import {
  type IDocumentService,
  type UploadDocumentInput,
  type SubmitQuizAttemptInput,
} from '@/features/document/domain/inbound/document.service';

export class DocumentService implements IDocumentService {
  constructor(
    private readonly uploadDocumentUseCase: UploadDocumentUseCase,
    private readonly getDocumentUseCase: GetDocumentUseCase,
    private readonly getUserDocumentsUseCase: GetUserDocumentsUseCase,
    private readonly getDocumentSummaryUseCase: GetDocumentSummaryUseCase,
    private readonly getDocumentQuizUseCase: GetDocumentQuizUseCase,
    private readonly getQuizQuestionsUseCase: GetQuizQuestionsUseCase,
    private readonly submitQuizAttemptUseCase: SubmitQuizAttemptUseCase,
    private readonly getQuizAttemptsUseCase: GetQuizAttemptsUseCase,
    private readonly deleteDocumentUseCase: DeleteDocumentUseCase,
  ) {}

  async upload(input: UploadDocumentInput): Promise<Document> {
    return await this.uploadDocumentUseCase.execute({
      filename: input.filename,
      mimeType: input.mimeType,
      size: input.size,
      fileBuffer: input.fileBuffer,
      userId: input.userId,
    });
  }

  async get(id: string): Promise<Document | null> {
    return await this.getDocumentUseCase.execute(id);
  }

  async list(): Promise<Document[]> {
    return await this.getDocumentUseCase.listAll();
  }

  async getUserDocuments(userId: string): Promise<Document[]> {
    return await this.getUserDocumentsUseCase.execute(userId);
  }

  async delete(id: string, userId: string): Promise<void> {
    return await this.deleteDocumentUseCase.execute(id, userId);
  }

  async getSummary(documentId: string): Promise<DocumentSummary | null> {
    return await this.getDocumentSummaryUseCase.execute(documentId);
  }

  async getQuizzes(documentId: string): Promise<Quiz[]> {
    return await this.getDocumentQuizUseCase.execute(documentId);
  }

  async getQuizWithQuestions(quizId: string): Promise<QuizWithQuestions> {
    return await this.getQuizQuestionsUseCase.execute(quizId);
  }

  async submitQuizAttempt(input: SubmitQuizAttemptInput): Promise<QuizAttempt> {
    return await this.submitQuizAttemptUseCase.execute(input);
  }

  async getQuizAttempts(
    userId: string,
    quizId: string,
  ): Promise<QuizAttempt[]> {
    return await this.getQuizAttemptsUseCase.execute(userId, quizId);
  }
}
