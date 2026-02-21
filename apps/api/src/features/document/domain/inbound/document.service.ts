import type {
  Document,
  DocumentSummary,
  Quiz,
  QuizAttempt,
} from '@sagepoint/domain';
import type { QuizWithQuestions } from '@/features/document/app/usecases/get-quiz-questions.usecase';

export const DOCUMENT_SERVICE = Symbol('DOCUMENT_SERVICE');

export interface UploadDocumentInput {
  filename: string;
  mimeType: string;
  size: number;
  fileBuffer: Buffer;
  userId: string;
}

export interface SubmitQuizAttemptInput {
  quizId: string;
  userId: string;
  answers: Record<string, string>;
}

export interface IDocumentService {
  upload(input: UploadDocumentInput): Promise<Document>;
  get(id: string): Promise<Document | null>;
  list(): Promise<Document[]>;
  getUserDocuments(userId: string): Promise<Document[]>;
  delete(id: string, userId: string): Promise<void>;
  getSummary(documentId: string): Promise<DocumentSummary | null>;
  getQuizzes(documentId: string): Promise<Quiz[]>;
  getQuizWithQuestions(quizId: string): Promise<QuizWithQuestions>;
  submitQuizAttempt(input: SubmitQuizAttemptInput): Promise<QuizAttempt>;
  getQuizAttempts(userId: string, quizId: string): Promise<QuizAttempt[]>;
}
