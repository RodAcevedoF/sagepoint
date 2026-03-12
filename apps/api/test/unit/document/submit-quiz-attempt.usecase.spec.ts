import { SubmitQuizAttemptUseCase } from '../../../src/features/document/app/usecases/submit-quiz-attempt.usecase';
import { Question, QuestionType } from '@sagepoint/domain';
import { NotFoundException } from '@nestjs/common';
import {
  FakeQuestionRepository,
  FakeQuizAttemptRepository,
} from '../_fakes/repositories';

function buildQuestion(
  id: string,
  correctLabel: string,
  quizId = 'quiz1',
): Question {
  return new Question(
    id,
    quizId,
    QuestionType.MULTIPLE_CHOICE,
    `Question ${id}`,
    [
      { label: 'A', text: 'Option A', isCorrect: correctLabel === 'A' },
      { label: 'B', text: 'Option B', isCorrect: correctLabel === 'B' },
      { label: 'C', text: 'Option C', isCorrect: correctLabel === 'C' },
    ],
    1,
    'medium',
    new Date('2026-01-01'),
  );
}

describe('SubmitQuizAttemptUseCase', () => {
  let questionRepo: FakeQuestionRepository;
  let attemptRepo: FakeQuizAttemptRepository;
  let useCase: SubmitQuizAttemptUseCase;

  beforeEach(() => {
    questionRepo = new FakeQuestionRepository();
    attemptRepo = new FakeQuizAttemptRepository();
    useCase = new SubmitQuizAttemptUseCase(questionRepo, attemptRepo);
  });

  describe('scoring', () => {
    beforeEach(() => {
      questionRepo.seed(
        buildQuestion('q1', 'A'),
        buildQuestion('q2', 'B'),
        buildQuestion('q3', 'C'),
      );
    });

    it.each([
      {
        scenario: 'all correct',
        answers: { q1: 'A', q2: 'B', q3: 'C' },
        expectedScore: 100,
        expectedCorrect: 3,
      },
      {
        scenario: 'two correct',
        answers: { q1: 'A', q2: 'B', q3: 'A' },
        expectedScore: (2 / 3) * 100,
        expectedCorrect: 2,
      },
      {
        scenario: 'one correct',
        answers: { q1: 'A', q2: 'A', q3: 'A' },
        expectedScore: (1 / 3) * 100,
        expectedCorrect: 1,
      },
      {
        scenario: 'none correct',
        answers: { q1: 'B', q2: 'A', q3: 'A' },
        expectedScore: 0,
        expectedCorrect: 0,
      },
    ])(
      'scores $expectedCorrect/3 when $scenario',
      async ({ answers, expectedScore, expectedCorrect }) => {
        const result = await useCase.execute({
          quizId: 'quiz1',
          userId: 'user1',
          answers,
        });

        expect(result.score).toBeCloseTo(expectedScore);
        expect(result.correctAnswers).toBe(expectedCorrect);
        expect(result.totalQuestions).toBe(3);
      },
    );

    it('persists the attempt', async () => {
      await useCase.execute({
        quizId: 'quiz1',
        userId: 'user1',
        answers: { q1: 'A', q2: 'B', q3: 'C' },
      });

      const saved = attemptRepo.getAll();
      expect(saved).toHaveLength(1);
      expect(saved[0].userId).toBe('user1');
    });
  });

  describe('when quiz has no questions', () => {
    it('throws NotFoundException', async () => {
      await expect(
        useCase.execute({ quizId: 'empty', userId: 'user1', answers: {} }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
