import {
  connectPrisma,
  disconnectPrisma,
  cleanDatabase,
  asPrismaService,
  getPrismaClient,
} from './_setup/prisma-test-client';
import { PrismaRoadmapRepository } from '@/features/roadmap/infra/driven/prisma-roadmap.repository';
import { PrismaResourceRepository } from '@/features/roadmap/infra/driven/prisma-resource.repository';
import { PrismaProgressRepository } from '@/features/roadmap/infra/driven/prisma-progress.repository';
import { PrismaStepQuizAttemptRepository } from '@/features/roadmap/infra/driven/prisma-step-quiz-attempt.repository';
import {
  Roadmap,
  Concept,
  RoadmapVisibility,
  Resource,
  ResourceType,
  UserRoadmapProgress,
  StepStatus,
  StepQuizAttempt,
  QuestionType,
} from '@sagepoint/domain';
import type { RoadmapGenerationStatus } from '@sagepoint/domain';

describe('Roadmap repositories (integration)', () => {
  let roadmapRepo: PrismaRoadmapRepository;
  let resourceRepo: PrismaResourceRepository;
  let progressRepo: PrismaProgressRepository;
  let stepQuizRepo: PrismaStepQuizAttemptRepository;

  const NOW = new Date('2026-01-01');
  const USER_ID = 'user-1';

  async function seedUser() {
    await getPrismaClient().user.create({
      data: {
        id: USER_ID,
        email: 'test@test.com',
        name: 'Test',
        password: 'x',
      },
    });
  }

  function buildRoadmap(
    overrides: Partial<{
      id: string;
      title: string;
      visibility: RoadmapVisibility;
      status: RoadmapGenerationStatus;
      steps: { concept: Concept; order: number; dependsOn: string[] }[];
    }> = {},
  ) {
    return new Roadmap({
      id: overrides.id ?? 'rm-1',
      title: overrides.title ?? 'Learn React',
      userId: USER_ID,
      description: 'A learning path',
      steps: overrides.steps ?? [
        { concept: new Concept('c1', 'Components'), order: 1, dependsOn: [] },
        { concept: new Concept('c2', 'Hooks'), order: 2, dependsOn: ['c1'] },
      ],
      generationStatus: overrides.status ?? 'completed',
      visibility: overrides.visibility ?? RoadmapVisibility.PRIVATE,
      createdAt: NOW,
    });
  }

  beforeAll(async () => {
    await connectPrisma();
    const prisma = asPrismaService();
    roadmapRepo = new PrismaRoadmapRepository(prisma);
    resourceRepo = new PrismaResourceRepository(prisma);
    progressRepo = new PrismaProgressRepository(prisma);
    stepQuizRepo = new PrismaStepQuizAttemptRepository(prisma);
  });

  afterAll(async () => {
    await disconnectPrisma();
  });

  beforeEach(async () => {
    await cleanDatabase();
    await seedUser();
  });

  // ─── Roadmap ───────────────────────────────────────────────────────────────

  describe('PrismaRoadmapRepository', () => {
    describe('save + findById', () => {
      it('creates a roadmap with serialized steps and retrieves it', async () => {
        await roadmapRepo.save(buildRoadmap());

        const found = await roadmapRepo.findById('rm-1');
        expect(found).not.toBeNull();
        expect(found!.title).toBe('Learn React');
        expect(found!.steps).toHaveLength(2);
        expect(found!.steps[0].concept.name).toBe('Components');
        expect(found!.steps[1].dependsOn).toEqual(['c1']);
      });

      it('updates a roadmap on second save', async () => {
        await roadmapRepo.save(buildRoadmap({ status: 'processing' }));
        await roadmapRepo.save(buildRoadmap({ status: 'completed' }));

        const found = await roadmapRepo.findById('rm-1');
        expect(found!.generationStatus).toBe('completed');
      });
    });

    describe('findByUserId', () => {
      it('returns roadmaps for a user', async () => {
        await roadmapRepo.save(buildRoadmap({ id: 'rm-1', title: 'React' }));
        await roadmapRepo.save(buildRoadmap({ id: 'rm-2', title: 'Vue' }));

        const found = await roadmapRepo.findByUserId(USER_ID);
        expect(found).toHaveLength(2);
      });
    });

    describe('findPublic', () => {
      it('returns only public + completed roadmaps', async () => {
        await roadmapRepo.save(
          buildRoadmap({
            id: 'rm-1',
            visibility: RoadmapVisibility.PUBLIC,
            status: 'completed',
          }),
        );
        await roadmapRepo.save(
          buildRoadmap({
            id: 'rm-2',
            visibility: RoadmapVisibility.PRIVATE,
            status: 'completed',
          }),
        );
        await roadmapRepo.save(
          buildRoadmap({
            id: 'rm-3',
            visibility: RoadmapVisibility.PUBLIC,
            status: 'processing',
          }),
        );

        const found = await roadmapRepo.findPublic();
        expect(found).toHaveLength(1);
        expect(found[0].id).toBe('rm-1');
      });
    });

    describe('updateVisibility', () => {
      it('changes visibility from private to public', async () => {
        await roadmapRepo.save(
          buildRoadmap({ visibility: RoadmapVisibility.PRIVATE }),
        );

        const updated = await roadmapRepo.updateVisibility(
          'rm-1',
          RoadmapVisibility.PUBLIC,
        );

        expect(updated.visibility).toBe(RoadmapVisibility.PUBLIC);
        const found = await roadmapRepo.findById('rm-1');
        expect(found!.visibility).toBe(RoadmapVisibility.PUBLIC);
      });
    });

    describe('delete', () => {
      it('removes a roadmap', async () => {
        await roadmapRepo.save(buildRoadmap());
        await roadmapRepo.delete('rm-1');

        const found = await roadmapRepo.findById('rm-1');
        expect(found).toBeNull();
      });
    });
  });

  // ─── Resource ──────────────────────────────────────────────────────────────

  describe('PrismaResourceRepository', () => {
    it('saves and retrieves resources by roadmapId', async () => {
      await roadmapRepo.save(buildRoadmap());

      const r1 = new Resource({
        id: 'res-1',
        title: 'React Docs',
        url: 'https://react.dev',
        type: ResourceType.DOCUMENTATION,
        conceptId: 'c1',
        roadmapId: 'rm-1',
        order: 1,
        createdAt: NOW,
      });
      const r2 = new Resource({
        id: 'res-2',
        title: 'Hooks Guide',
        url: 'https://hooks.dev',
        type: ResourceType.TUTORIAL,
        conceptId: 'c2',
        roadmapId: 'rm-1',
        order: 2,
        createdAt: NOW,
      });

      await resourceRepo.saveMany([r1, r2]);

      const found = await resourceRepo.findByRoadmapId('rm-1');
      expect(found).toHaveLength(2);
      expect(found[0].order).toBe(1);
      expect(found[1].order).toBe(2);
    });

    it('finds resources by conceptId', async () => {
      await roadmapRepo.save(buildRoadmap());

      await resourceRepo.save(
        new Resource({
          id: 'res-1',
          title: 'A',
          url: 'https://a.com',
          type: ResourceType.ARTICLE,
          conceptId: 'c1',
          roadmapId: 'rm-1',
          order: 1,
          createdAt: NOW,
        }),
      );
      await resourceRepo.save(
        new Resource({
          id: 'res-2',
          title: 'B',
          url: 'https://b.com',
          type: ResourceType.VIDEO,
          conceptId: 'c2',
          roadmapId: 'rm-1',
          order: 1,
          createdAt: NOW,
        }),
      );

      const found = await resourceRepo.findByConceptId('c1');
      expect(found).toHaveLength(1);
      expect(found[0].title).toBe('A');
    });

    it('deletes resources by roadmapId', async () => {
      await roadmapRepo.save(buildRoadmap());
      await resourceRepo.save(
        new Resource({
          id: 'res-1',
          title: 'X',
          url: 'https://x.com',
          type: ResourceType.ARTICLE,
          conceptId: 'c1',
          roadmapId: 'rm-1',
          order: 1,
          createdAt: NOW,
        }),
      );

      await resourceRepo.deleteByRoadmapId('rm-1');

      const found = await resourceRepo.findByRoadmapId('rm-1');
      expect(found).toEqual([]);
    });
  });

  // ─── Progress ──────────────────────────────────────────────────────────────

  describe('PrismaProgressRepository', () => {
    describe('upsert + find', () => {
      it('creates and retrieves progress for a user+roadmap+concept', async () => {
        await roadmapRepo.save(buildRoadmap());

        const progress = new UserRoadmapProgress({
          userId: USER_ID,
          roadmapId: 'rm-1',
          conceptId: 'c1',
          status: StepStatus.IN_PROGRESS,
          createdAt: NOW,
          updatedAt: NOW,
        });
        await progressRepo.upsert(progress);

        const found = await progressRepo.findByUserRoadmapAndConcept(
          USER_ID,
          'rm-1',
          'c1',
        );
        expect(found).not.toBeNull();
        expect(found!.status).toBe(StepStatus.IN_PROGRESS);
      });

      it('updates status on second upsert (composite key)', async () => {
        await roadmapRepo.save(buildRoadmap());

        await progressRepo.upsert(
          new UserRoadmapProgress({
            userId: USER_ID,
            roadmapId: 'rm-1',
            conceptId: 'c1',
            status: StepStatus.IN_PROGRESS,
            createdAt: NOW,
            updatedAt: NOW,
          }),
        );
        await progressRepo.upsert(
          new UserRoadmapProgress({
            userId: USER_ID,
            roadmapId: 'rm-1',
            conceptId: 'c1',
            status: StepStatus.COMPLETED,
            completedAt: NOW,
            createdAt: NOW,
            updatedAt: NOW,
          }),
        );

        const found = await progressRepo.findByUserRoadmapAndConcept(
          USER_ID,
          'rm-1',
          'c1',
        );
        expect(found!.status).toBe(StepStatus.COMPLETED);
      });
    });

    describe('upsertMany (transaction)', () => {
      it('batch upserts multiple progress entries', async () => {
        await roadmapRepo.save(buildRoadmap());

        const entries = [
          new UserRoadmapProgress({
            userId: USER_ID,
            roadmapId: 'rm-1',
            conceptId: 'c1',
            status: StepStatus.COMPLETED,
            completedAt: NOW,
            createdAt: NOW,
            updatedAt: NOW,
          }),
          new UserRoadmapProgress({
            userId: USER_ID,
            roadmapId: 'rm-1',
            conceptId: 'c2',
            status: StepStatus.IN_PROGRESS,
            createdAt: NOW,
            updatedAt: NOW,
          }),
        ];
        await progressRepo.upsertMany(entries);

        const all = await progressRepo.findByUserAndRoadmap(USER_ID, 'rm-1');
        expect(all).toHaveLength(2);
      });
    });

    describe('getProgressSummary (groupBy aggregation)', () => {
      it('computes correct progress percentages', async () => {
        await roadmapRepo.save(buildRoadmap());

        await progressRepo.upsert(
          new UserRoadmapProgress({
            userId: USER_ID,
            roadmapId: 'rm-1',
            conceptId: 'c1',
            status: StepStatus.COMPLETED,
            completedAt: NOW,
            createdAt: NOW,
            updatedAt: NOW,
          }),
        );
        await progressRepo.upsert(
          new UserRoadmapProgress({
            userId: USER_ID,
            roadmapId: 'rm-1',
            conceptId: 'c2',
            status: StepStatus.IN_PROGRESS,
            createdAt: NOW,
            updatedAt: NOW,
          }),
        );

        const summary = await progressRepo.getProgressSummary(USER_ID, 'rm-1');
        expect(summary).not.toBeNull();
        expect(summary!.totalSteps).toBe(2);
        expect(summary!.completedSteps).toBe(1);
        expect(summary!.inProgressSteps).toBe(1);
        expect(summary!.progressPercentage).toBe(50);
      });

      it('returns null for non-existent roadmap', async () => {
        const summary = await progressRepo.getProgressSummary(USER_ID, 'nope');
        expect(summary).toBeNull();
      });
    });

    describe('getCompletedConceptIds', () => {
      it('returns only completed concept IDs', async () => {
        await roadmapRepo.save(buildRoadmap());

        await progressRepo.upsert(
          new UserRoadmapProgress({
            userId: USER_ID,
            roadmapId: 'rm-1',
            conceptId: 'c1',
            status: StepStatus.COMPLETED,
            completedAt: NOW,
            createdAt: NOW,
            updatedAt: NOW,
          }),
        );
        await progressRepo.upsert(
          new UserRoadmapProgress({
            userId: USER_ID,
            roadmapId: 'rm-1',
            conceptId: 'c2',
            status: StepStatus.IN_PROGRESS,
            createdAt: NOW,
            updatedAt: NOW,
          }),
        );

        const completed = await progressRepo.getCompletedConceptIds(
          USER_ID,
          'rm-1',
        );
        expect(completed).toEqual(['c1']);
      });
    });

    describe('deleteByUserAndRoadmap', () => {
      it('removes all progress for a user+roadmap', async () => {
        await roadmapRepo.save(buildRoadmap());
        await progressRepo.upsert(
          new UserRoadmapProgress({
            userId: USER_ID,
            roadmapId: 'rm-1',
            conceptId: 'c1',
            status: StepStatus.COMPLETED,
            completedAt: NOW,
            createdAt: NOW,
            updatedAt: NOW,
          }),
        );

        await progressRepo.deleteByUserAndRoadmap(USER_ID, 'rm-1');

        const found = await progressRepo.findByUserAndRoadmap(USER_ID, 'rm-1');
        expect(found).toEqual([]);
      });
    });
  });

  // ─── StepQuizAttempt ───────────────────────────────────────────────────────

  describe('PrismaStepQuizAttemptRepository', () => {
    const questions = [
      {
        text: 'Q1?',
        type: QuestionType.MULTIPLE_CHOICE,
        options: [
          { label: 'A', text: 'Option A', isCorrect: true },
          { label: 'B', text: 'Option B', isCorrect: false },
        ],
        difficulty: 'medium',
      },
      {
        text: 'Q2?',
        type: QuestionType.MULTIPLE_CHOICE,
        options: [
          { label: 'X', text: 'Option X', isCorrect: false },
          { label: 'Y', text: 'Option Y', isCorrect: true },
        ],
        difficulty: 'medium',
      },
    ];

    it('creates and finds a step quiz attempt', async () => {
      await roadmapRepo.save(buildRoadmap());

      const attempt = new StepQuizAttempt({
        id: 'sqa-1',
        userId: USER_ID,
        roadmapId: 'rm-1',
        conceptId: 'c1',
        questions,
        totalQuestions: 2,
        score: 0,
        correctAnswers: 0,
        passed: false,
        createdAt: NOW,
      });
      await stepQuizRepo.create(attempt);

      const found = await stepQuizRepo.findById('sqa-1');
      expect(found).not.toBeNull();
      expect(found!.totalQuestions).toBe(2);
      expect(found!.completedAt).toBeUndefined();
    });

    it('finds pending attempt by user+concept', async () => {
      await roadmapRepo.save(buildRoadmap());

      await stepQuizRepo.create(
        new StepQuizAttempt({
          id: 'sqa-1',
          userId: USER_ID,
          roadmapId: 'rm-1',
          conceptId: 'c1',
          questions,
          totalQuestions: 2,
          score: 0,
          correctAnswers: 0,
          passed: false,
          createdAt: NOW,
        }),
      );

      const pending = await stepQuizRepo.findPendingByUserAndConcept(
        USER_ID,
        'rm-1',
        'c1',
      );
      expect(pending).not.toBeNull();
      expect(pending!.id).toBe('sqa-1');
    });

    it('updates attempt with answers and score', async () => {
      await roadmapRepo.save(buildRoadmap());

      const attempt = new StepQuizAttempt({
        id: 'sqa-1',
        userId: USER_ID,
        roadmapId: 'rm-1',
        conceptId: 'c1',
        questions,
        totalQuestions: 2,
        score: 0,
        correctAnswers: 0,
        passed: false,
        createdAt: NOW,
      });
      await stepQuizRepo.create(attempt);

      const completed = new StepQuizAttempt({
        ...attempt,
        answers: { 0: 'A', 1: 'Y' },
        score: 100,
        correctAnswers: 2,
        passed: true,
        completedAt: NOW,
      });
      const updated = await stepQuizRepo.update(completed);

      expect(updated.passed).toBe(true);
      expect(updated.score).toBe(100);
      expect(updated.completedAt).toBeDefined();
    });
  });
});
