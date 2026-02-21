import type { Question } from '../entities/question.entity';

export const QUESTION_REPOSITORY = Symbol('QUESTION_REPOSITORY');

export interface IQuestionRepository {
  saveMany(questions: Question[]): Promise<void>;
  findByQuizId(quizId: string): Promise<Question[]>;
  deleteByQuizId(quizId: string): Promise<void>;
}
