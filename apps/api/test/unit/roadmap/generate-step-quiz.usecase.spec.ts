import { GenerateStepQuizUseCase } from '../../../src/features/roadmap/app/usecases/generate-step-quiz.usecase';
import {
  Roadmap,
  Concept,
  StepQuizAttempt,
  QuestionType,
} from '@sagepoint/domain';
import {
  FakeRoadmapRepository,
  FakeQuizGenerationService,
  FakeStepQuizAttemptRepository,
} from '../_fakes/repositories';

const ROADMAP = new Roadmap({
  id: 'r1',
  title: 'Test',
  userId: 'user1',
  steps: [
    {
      concept: Concept.create(
        'c1',
        'JavaScript',
        undefined,
        'A programming language',
      ),
      order: 1,
      dependsOn: [],
      learningObjective: 'Learn JS basics',
    },
  ],
  createdAt: new Date('2026-01-01'),
});

const GENERATED_QUESTIONS = [
  {
    type: QuestionType.MULTIPLE_CHOICE,
    text: 'What is JS?',
    options: [
      { label: 'A', text: 'A language', isCorrect: true },
      { label: 'B', text: 'A database', isCorrect: false },
    ],
    explanation: 'JS is a language',
    difficulty: 'intermediate',
  },
];

describe('GenerateStepQuizUseCase', () => {
  let roadmapRepo: FakeRoadmapRepository;
  let quizGenService: FakeQuizGenerationService;
  let attemptRepo: FakeStepQuizAttemptRepository;
  let useCase: GenerateStepQuizUseCase;

  beforeEach(() => {
    roadmapRepo = new FakeRoadmapRepository();
    quizGenService = new FakeQuizGenerationService();
    attemptRepo = new FakeStepQuizAttemptRepository();
    roadmapRepo.seed(ROADMAP);
    quizGenService.setResults(GENERATED_QUESTIONS);
    useCase = new GenerateStepQuizUseCase(
      roadmapRepo,
      quizGenService,
      attemptRepo,
    );
  });

  describe('when no pending attempt exists', () => {
    it('generates questions, creates an attempt, and strips isCorrect from response', async () => {
      const result = await useCase.execute({
        userId: 'user1',
        roadmapId: 'r1',
        conceptId: 'c1',
      });

      expect(result.attemptId).toBeDefined();
      expect(result.questions).toHaveLength(1);
      expect(result.questions[0].text).toBe('What is JS?');
      // isCorrect should NOT be in the client response
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect((result.questions[0] as any).options[0].isCorrect).toBeUndefined();
    });

    it('persists the attempt with full question data', async () => {
      const result = await useCase.execute({
        userId: 'user1',
        roadmapId: 'r1',
        conceptId: 'c1',
      });

      const stored = attemptRepo.getById(result.attemptId);
      expect(stored).toBeDefined();
      expect(stored!.questions[0].options[0].isCorrect).toBe(true);
    });
  });

  describe('when a pending attempt already exists (idempotency)', () => {
    it('returns the existing attempt without generating new questions', async () => {
      attemptRepo.seed(
        new StepQuizAttempt({
          id: 'existing-attempt',
          userId: 'user1',
          roadmapId: 'r1',
          conceptId: 'c1',
          questions: GENERATED_QUESTIONS,
          score: 0,
          totalQuestions: 1,
          correctAnswers: 0,
          passed: false,
          createdAt: new Date('2026-01-01'),
        }),
      );

      const result = await useCase.execute({
        userId: 'user1',
        roadmapId: 'r1',
        conceptId: 'c1',
      });

      expect(result.attemptId).toBe('existing-attempt');
    });
  });

  describe('error cases', () => {
    it('throws when roadmap does not exist', async () => {
      await expect(
        useCase.execute({
          userId: 'user1',
          roadmapId: 'nonexistent',
          conceptId: 'c1',
        }),
      ).rejects.toThrow('not found');
    });

    it('throws when concept is not in the roadmap', async () => {
      await expect(
        useCase.execute({ userId: 'user1', roadmapId: 'r1', conceptId: 'c99' }),
      ).rejects.toThrow('not found in roadmap');
    });
  });
});
