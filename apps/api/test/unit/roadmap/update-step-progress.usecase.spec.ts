import { UpdateStepProgressUseCase } from '../../../src/features/roadmap/app/usecases/update-step-progress.usecase';
import { Roadmap, Concept, StepStatus } from '@sagepoint/domain';
import {
  FakeProgressRepository,
  FakeRoadmapRepository,
} from '../_fakes/repositories';

const ROADMAP = new Roadmap({
  id: 'r1',
  title: 'Test Roadmap',
  userId: 'u1',
  steps: [
    { concept: Concept.create('c1', 'Intro'), order: 1, dependsOn: [] },
    {
      concept: Concept.create('c2', 'Advanced'),
      order: 2,
      dependsOn: ['c1'],
    },
  ],
  createdAt: new Date('2026-01-01'),
});

describe('UpdateStepProgressUseCase', () => {
  let progressRepo: FakeProgressRepository;
  let roadmapRepo: FakeRoadmapRepository;
  let useCase: UpdateStepProgressUseCase;

  beforeEach(() => {
    progressRepo = new FakeProgressRepository();
    roadmapRepo = new FakeRoadmapRepository();
    roadmapRepo.seed(ROADMAP);
    useCase = new UpdateStepProgressUseCase(progressRepo, roadmapRepo);
  });

  describe('successful update', () => {
    it.each([
      StepStatus.COMPLETED,
      StepStatus.IN_PROGRESS,
      StepStatus.SKIPPED,
    ])('upserts progress with status %s and returns summary', async (status) => {
      const result = await useCase.execute({
        userId: 'u1',
        roadmapId: 'r1',
        conceptId: 'c1',
        status,
      });

      expect(result.progress.status).toBe(status);
      expect(result.summary.roadmapId).toBe('r1');
    });

    it('computes correct summary after multiple updates', async () => {
      await useCase.execute({
        userId: 'u1',
        roadmapId: 'r1',
        conceptId: 'c1',
        status: StepStatus.COMPLETED,
      });
      const result = await useCase.execute({
        userId: 'u1',
        roadmapId: 'r1',
        conceptId: 'c2',
        status: StepStatus.IN_PROGRESS,
      });

      expect(result.summary.completedSteps).toBe(1);
      expect(result.summary.inProgressSteps).toBe(1);
    });
  });

  describe('validation', () => {
    it('throws when roadmap does not exist', async () => {
      await expect(
        useCase.execute({
          userId: 'u1',
          roadmapId: 'nonexistent',
          conceptId: 'c1',
          status: StepStatus.COMPLETED,
        }),
      ).rejects.toThrow('not found');
    });

    it('throws when concept does not exist in roadmap', async () => {
      await expect(
        useCase.execute({
          userId: 'u1',
          roadmapId: 'r1',
          conceptId: 'nonexistent',
          status: StepStatus.COMPLETED,
        }),
      ).rejects.toThrow('not found in roadmap');
    });
  });
});
