import { GenerateStepQuizUseCase } from '../../../src/features/roadmap/app/usecases/generate-step-quiz.usecase';
import {
  Roadmap,
  Concept,
  StepQuizAttempt,
  QuestionType,
  type RoadmapStepQuestion,
} from '@sagepoint/domain';
import {
  FakeRoadmapRepository,
  FakeQuizGenerationService,
  FakeStepQuizAttemptRepository,
  FakeRoadmapStepQuestionRepository,
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

const STORED_QUESTIONS = GENERATED_QUESTIONS.map((q, i) => ({
  ...q,
  id: `stored-q-${i}`,
}));

const CANONICAL_QUESTION: RoadmapStepQuestion = {
  id: 'canonical-q-0',
  roadmapId: 'r1',
  conceptId: 'c1',
  stepOrder: 1,
  position: 0,
  text: 'Canonical: What is JS?',
  type: QuestionType.MULTIPLE_CHOICE,
  options: [
    { label: 'A', text: 'A language', isCorrect: true },
    { label: 'B', text: 'A database', isCorrect: false },
  ],
  explanation: 'JS is a language',
  difficulty: 'intermediate',
};

describe('GenerateStepQuizUseCase', () => {
  let roadmapRepo: FakeRoadmapRepository;
  let quizGenService: FakeQuizGenerationService;
  let attemptRepo: FakeStepQuizAttemptRepository;
  let stepQuestionRepo: FakeRoadmapStepQuestionRepository;
  let useCase: GenerateStepQuizUseCase;

  beforeEach(() => {
    roadmapRepo = new FakeRoadmapRepository();
    quizGenService = new FakeQuizGenerationService();
    attemptRepo = new FakeStepQuizAttemptRepository();
    stepQuestionRepo = new FakeRoadmapStepQuestionRepository();
    roadmapRepo.seed(ROADMAP);
    quizGenService.setResults(GENERATED_QUESTIONS);
    useCase = new GenerateStepQuizUseCase(
      roadmapRepo,
      quizGenService,
      attemptRepo,
      stepQuestionRepo,
    );
  });

  describe('when canonical questions exist (read-first path)', () => {
    it('uses canonical questions and preserves their stable ids', async () => {
      stepQuestionRepo.seed(CANONICAL_QUESTION);

      const result = await useCase.execute({
        userId: 'user1',
        roadmapId: 'r1',
        conceptId: 'c1',
      });

      expect(result.questions).toHaveLength(1);
      expect(result.questions[0].text).toBe('Canonical: What is JS?');

      const stored = attemptRepo.getById(result.attemptId);
      expect(stored!.questions[0].id).toBe('canonical-q-0');
      // LLM should not have been written into the table again
      expect(stepQuestionRepo.getAll()).toHaveLength(1);
    });

    it('strips isCorrect from the client response', async () => {
      stepQuestionRepo.seed(CANONICAL_QUESTION);

      const result = await useCase.execute({
        userId: 'user1',
        roadmapId: 'r1',
        conceptId: 'c1',
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect((result.questions[0] as any).options[0].isCorrect).toBeUndefined();
    });
  });

  describe('when no canonical questions exist (generate + persist fallback)', () => {
    it('generates via the LLM, persists them, and creates an attempt', async () => {
      const result = await useCase.execute({
        userId: 'user1',
        roadmapId: 'r1',
        conceptId: 'c1',
      });

      expect(result.attemptId).toBeDefined();
      expect(result.questions).toHaveLength(1);
      expect(result.questions[0].text).toBe('What is JS?');

      const persisted = stepQuestionRepo.getAll();
      expect(persisted).toHaveLength(1);
      expect(persisted[0].roadmapId).toBe('r1');
      expect(persisted[0].conceptId).toBe('c1');
      expect(persisted[0].stepOrder).toBe(1);
      expect(persisted[0].position).toBe(0);

      const stored = attemptRepo.getById(result.attemptId);
      expect(stored!.questions[0].id).toBe(persisted[0].id);
      expect(stored!.questions[0].options[0].isCorrect).toBe(true);
    });
  });

  describe('when a pending attempt already exists (idempotency)', () => {
    it('returns the existing attempt without generating or reading canonical questions', async () => {
      attemptRepo.seed(
        new StepQuizAttempt({
          id: 'existing-attempt',
          userId: 'user1',
          roadmapId: 'r1',
          conceptId: 'c1',
          questions: STORED_QUESTIONS,
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
      expect(stepQuestionRepo.getAll()).toHaveLength(0);
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
