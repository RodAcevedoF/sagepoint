import { SubmitStepQuizUseCase } from '../../../src/features/roadmap/app/usecases/submit-step-quiz.usecase';
import { UpdateStepProgressUseCase } from '../../../src/features/roadmap/app/usecases/update-step-progress.usecase';
import {
  StepQuizAttempt,
  QuestionType,
  StepStatus,
  Concept,
  Roadmap,
} from '@sagepoint/domain';
import {
  FakeStepQuizAttemptRepository,
  FakeProgressRepository,
  FakeRoadmapRepository,
} from '../_fakes/repositories';

function buildPendingAttempt(userId = 'user1'): StepQuizAttempt {
  return new StepQuizAttempt({
    id: 'attempt1',
    userId,
    roadmapId: 'r1',
    conceptId: 'c1',
    questions: [
      {
        text: 'Q1',
        type: QuestionType.MULTIPLE_CHOICE,
        options: [
          { label: 'A', text: 'Correct', isCorrect: true },
          { label: 'B', text: 'Wrong', isCorrect: false },
        ],
        difficulty: 'medium',
      },
      {
        text: 'Q2',
        type: QuestionType.MULTIPLE_CHOICE,
        options: [
          { label: 'A', text: 'Wrong', isCorrect: false },
          { label: 'B', text: 'Correct', isCorrect: true },
        ],
        difficulty: 'medium',
      },
      {
        text: 'Q3',
        type: QuestionType.MULTIPLE_CHOICE,
        options: [
          { label: 'A', text: 'Correct', isCorrect: true },
          { label: 'B', text: 'Wrong', isCorrect: false },
        ],
        difficulty: 'medium',
      },
    ],
    score: 0,
    totalQuestions: 3,
    correctAnswers: 0,
    passed: false,
    createdAt: new Date('2026-01-01'),
  });
}

describe('SubmitStepQuizUseCase', () => {
  let attemptRepo: FakeStepQuizAttemptRepository;
  let progressRepo: FakeProgressRepository;
  let roadmapRepo: FakeRoadmapRepository;
  let useCase: SubmitStepQuizUseCase;

  beforeEach(() => {
    attemptRepo = new FakeStepQuizAttemptRepository();
    progressRepo = new FakeProgressRepository();
    roadmapRepo = new FakeRoadmapRepository();

    // Seed a roadmap with concept c1 so UpdateStepProgress can validate it
    roadmapRepo.seed(
      new Roadmap({
        id: 'r1',
        title: 'Test',
        userId: 'user1',
        steps: [
          { concept: Concept.create('c1', 'Intro'), order: 1, dependsOn: [] },
        ],
        createdAt: new Date('2026-01-01'),
      }),
    );

    const updateStepProgress = new UpdateStepProgressUseCase(
      progressRepo,
      roadmapRepo,
    );
    useCase = new SubmitStepQuizUseCase(attemptRepo, updateStepProgress);
  });

  describe('grading', () => {
    it.each([
      {
        scenario: 'all correct (passes)',
        answers: { 0: 'A', 1: 'B', 2: 'A' },
        expectedCorrect: 3,
        expectedPassed: true,
      },
      {
        scenario: 'two correct (passes, meets threshold)',
        answers: { 0: 'A', 1: 'B', 2: 'B' },
        expectedCorrect: 2,
        expectedPassed: true,
      },
      {
        scenario: 'one correct (fails)',
        answers: { 0: 'A', 1: 'A', 2: 'B' },
        expectedCorrect: 1,
        expectedPassed: false,
      },
      {
        scenario: 'none correct (fails)',
        answers: { 0: 'B', 1: 'A', 2: 'B' },
        expectedCorrect: 0,
        expectedPassed: false,
      },
    ])(
      '$scenario → $expectedCorrect/3',
      async ({ answers, expectedCorrect, expectedPassed }) => {
        attemptRepo.seed(buildPendingAttempt());

        const result = await useCase.execute({
          userId: 'user1',
          attemptId: 'attempt1',
          answers,
        });

        expect(result.correctAnswers).toBe(expectedCorrect);
        expect(result.passed).toBe(expectedPassed);
        expect(result.score).toBe(
          Math.round((expectedCorrect / 3) * 100),
        );
      },
    );
  });

  describe('side effects', () => {
    it('marks the attempt as completed', async () => {
      attemptRepo.seed(buildPendingAttempt());

      await useCase.execute({
        userId: 'user1',
        attemptId: 'attempt1',
        answers: { 0: 'A', 1: 'B', 2: 'A' },
      });

      const updated = attemptRepo.getById('attempt1');
      expect(updated!.completedAt).toBeDefined();
    });

    it('marks step as COMPLETED when the quiz is passed', async () => {
      attemptRepo.seed(buildPendingAttempt());

      await useCase.execute({
        userId: 'user1',
        attemptId: 'attempt1',
        answers: { 0: 'A', 1: 'B', 2: 'A' },
      });

      const progress = await progressRepo.findByUserRoadmapAndConcept(
        'user1',
        'r1',
        'c1',
      );
      expect(progress).not.toBeNull();
      expect(progress!.status).toBe(StepStatus.COMPLETED);
    });

    it('does NOT update progress when the quiz is failed', async () => {
      attemptRepo.seed(buildPendingAttempt());

      await useCase.execute({
        userId: 'user1',
        attemptId: 'attempt1',
        answers: { 0: 'B', 1: 'A', 2: 'B' },
      });

      const progress = await progressRepo.findByUserRoadmapAndConcept(
        'user1',
        'r1',
        'c1',
      );
      expect(progress).toBeNull();
    });
  });

  describe('error cases', () => {
    it('throws when attempt is not found', async () => {
      await expect(
        useCase.execute({ userId: 'user1', attemptId: 'x', answers: {} }),
      ).rejects.toThrow('not found');
    });

    it('throws when attempt belongs to another user', async () => {
      attemptRepo.seed(buildPendingAttempt('other-user'));

      await expect(
        useCase.execute({
          userId: 'user1',
          attemptId: 'attempt1',
          answers: {},
        }),
      ).rejects.toThrow('Unauthorized');
    });

    it('throws when attempt has already been submitted', async () => {
      attemptRepo.seed(
        new StepQuizAttempt({
          ...buildPendingAttempt(),
          completedAt: new Date('2026-01-02'),
        }),
      );

      await expect(
        useCase.execute({
          userId: 'user1',
          attemptId: 'attempt1',
          answers: {},
        }),
      ).rejects.toThrow('already been submitted');
    });
  });
});
