import { GetUserRoadmapsUseCase } from '../../../src/features/roadmap/app/usecases/get-user-roadmaps.usecase';
import {
  Roadmap,
  Concept,
  UserRoadmapProgress,
  StepStatus,
} from '@sagepoint/domain';
import {
  FakeRoadmapRepository,
  FakeProgressRepository,
  FakeResourceRepository,
} from '../_fakes/repositories';

function buildRoadmap(id: string, userId = 'user1'): Roadmap {
  return new Roadmap({
    id,
    title: `Roadmap ${id}`,
    userId,
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
}

describe('GetUserRoadmapsUseCase', () => {
  let roadmapRepo: FakeRoadmapRepository;
  let progressRepo: FakeProgressRepository;
  let resourceRepo: FakeResourceRepository;
  let useCase: GetUserRoadmapsUseCase;

  beforeEach(() => {
    roadmapRepo = new FakeRoadmapRepository();
    progressRepo = new FakeProgressRepository();
    resourceRepo = new FakeResourceRepository();
    useCase = new GetUserRoadmapsUseCase(
      roadmapRepo,
      progressRepo,
      resourceRepo,
    );
  });

  describe('execute', () => {
    it('returns roadmaps with their progress summaries', async () => {
      roadmapRepo.seed(buildRoadmap('r1'));
      progressRepo.seed(
        UserRoadmapProgress.create('user1', 'r1', 'c1', StepStatus.COMPLETED),
      );

      const result = await useCase.execute('user1');

      expect(result).toHaveLength(1);
      expect(result[0].progress.completedSteps).toBe(1);
      expect(result[0].progress.progressPercentage).toBe(100);
    });

    it('returns default progress when no entries exist', async () => {
      roadmapRepo.seed(buildRoadmap('r1'));

      const result = await useCase.execute('user1');

      expect(result[0].progress.completedSteps).toBe(0);
      expect(result[0].progress.progressPercentage).toBe(0);
    });

    it('returns empty array when user has no roadmaps', async () => {
      const result = await useCase.execute('user-no-roadmaps');

      expect(result).toEqual([]);
    });

    it('does not return roadmaps belonging to other users', async () => {
      roadmapRepo.seed(buildRoadmap('r1', 'other-user'));

      const result = await useCase.execute('user1');

      expect(result).toEqual([]);
    });
  });
});
