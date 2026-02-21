import type { Quiz } from '../entities/quiz.entity';

export const QUIZ_REPOSITORY = Symbol('QUIZ_REPOSITORY');

export interface IQuizRepository {
  save(quiz: Quiz): Promise<void>;
  findById(id: string): Promise<Quiz | null>;
  findByDocumentId(documentId: string): Promise<Quiz[]>;
  delete(id: string): Promise<void>;
}
