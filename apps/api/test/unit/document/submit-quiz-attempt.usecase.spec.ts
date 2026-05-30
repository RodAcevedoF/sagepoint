import { SubmitQuizAttemptUseCase } from '../../../src/features/document/app/usecases/submit-quiz-attempt.usecase';
import { ScheduleReviewUseCase } from '../../../src/features/review/app/usecases/schedule-review.usecase';
import { Question, QuestionType, ReviewSource } from '@sagepoint/domain';
import { NotFoundException } from '@nestjs/common';
import {
  FakeQuestionRepository,
  FakeQuizAttemptRepository,
  FakeReviewCardRepository,
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
  let reviewCardRepo: FakeReviewCardRepository;
  let scheduleReviewUseCase: ScheduleReviewUseCase;
  let useCase: SubmitQuizAttemptUseCase;

  beforeEach(() => {
    questionRepo = new FakeQuestionRepository();
    attemptRepo = new FakeQuizAttemptRepository();
    reviewCardRepo = new FakeReviewCardRepository();
    scheduleReviewUseCase = new ScheduleReviewUseCase(reviewCardRepo);
    useCase = new SubmitQuizAttemptUseCase(
      questionRepo,
      attemptRepo,
      scheduleReviewUseCase,
    );
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

  describe('spaced repetition scheduling', () => {
    beforeEach(() => {
      questionRepo.seed(buildQuestion('q1', 'A'), buildQuestion('q2', 'B'));
    });

    it('schedules a review card per question with quality keyed to correctness', async () => {
      await useCase.execute({
        quizId: 'quiz1',
        userId: 'user1',
        answers: { q1: 'A', q2: 'C' }, // q1 correct, q2 wrong
      });

      const cards = reviewCardRepo.getAll();
      expect(cards).toHaveLength(2);

      const q1Card = cards.find((c) => c.questionId === 'q1');
      const q2Card = cards.find((c) => c.questionId === 'q2');
      expect(q1Card).toBeDefined();
      expect(q2Card).toBeDefined();
      expect(q1Card!.source).toBe(ReviewSource.DOCUMENT);
      expect(q1Card!.sourceId).toBe('quiz1');
      expect(q1Card!.userId).toBe('user1');
      // Correct: SM-2 quality 4 → repetitions=1, lapses=0
      expect(q1Card!.repetitions).toBe(1);
      expect(q1Card!.lapses).toBe(0);
      // Incorrect: SM-2 quality 1 → repetitions=0, lapses=1
      expect(q2Card!.repetitions).toBe(0);
      expect(q2Card!.lapses).toBe(1);
    });
  });
});
