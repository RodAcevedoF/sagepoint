import { GetQuizAttemptsUseCase } from '../../../src/features/document/app/usecases/get-quiz-attempts.usecase';
import { QuizAttempt } from '@sagepoint/domain';
import { FakeQuizAttemptRepository } from '../_fakes/repositories';

const FIXED_DATE = new Date('2026-01-01');

describe('GetQuizAttemptsUseCase', () => {
  let attemptRepo: FakeQuizAttemptRepository;
  let useCase: GetQuizAttemptsUseCase;

  beforeEach(() => {
    attemptRepo = new FakeQuizAttemptRepository();
    useCase = new GetQuizAttemptsUseCase(attemptRepo);
  });

  it('returns attempts for a specific user and quiz', async () => {
    await attemptRepo.save(
      new QuizAttempt('a1', 'quiz1', 'user1', {}, 80, 5, 4, FIXED_DATE),
    );
    await attemptRepo.save(
      new QuizAttempt('a2', 'quiz1', 'user1', {}, 60, 5, 3, FIXED_DATE),
    );
    await attemptRepo.save(
      new QuizAttempt('a3', 'quiz2', 'user1', {}, 100, 3, 3, FIXED_DATE),
    );

    const result = await useCase.execute('user1', 'quiz1');

    expect(result).toHaveLength(2);
    expect(result.every((a) => a.quizId === 'quiz1')).toBe(true);
  });

  it('returns empty array when no attempts exist', async () => {
    const result = await useCase.execute('user1', 'no-attempts');

    expect(result).toEqual([]);
  });
});
