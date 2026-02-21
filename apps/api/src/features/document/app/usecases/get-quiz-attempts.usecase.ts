import type { QuizAttempt, IQuizAttemptRepository } from '@sagepoint/domain';

export class GetQuizAttemptsUseCase {
  constructor(private readonly attemptRepository: IQuizAttemptRepository) {}

  async execute(userId: string, quizId: string): Promise<QuizAttempt[]> {
    return await this.attemptRepository.findByUserAndQuiz(userId, quizId);
  }
}
