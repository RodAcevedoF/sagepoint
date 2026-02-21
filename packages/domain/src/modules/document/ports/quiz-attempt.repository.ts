import type { QuizAttempt } from '../entities/quiz-attempt.entity';

export const QUIZ_ATTEMPT_REPOSITORY = Symbol('QUIZ_ATTEMPT_REPOSITORY');

export interface IQuizAttemptRepository {
  save(attempt: QuizAttempt): Promise<void>;
  findByUserAndQuiz(userId: string, quizId: string): Promise<QuizAttempt[]>;
  findByUser(userId: string): Promise<QuizAttempt[]>;
}
