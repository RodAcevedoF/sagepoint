import { RefreshResourcesUseCase } from '../../../src/features/roadmap/app/usecases/refresh-resources.usecase';
import { Roadmap, Concept, ResourceType, Resource } from '@sagepoint/domain';
import {
  FakeRoadmapRepository,
  FakeResourceRepository,
  FakeResourceDiscoveryService,
} from '../_fakes/repositories';

const ROADMAP = new Roadmap({
  id: 'r1',
  title: 'Test',
  userId: 'user1',
  steps: [
    { concept: Concept.create('c1', 'JavaScript'), order: 1, dependsOn: [] },
    { concept: Concept.create('c2', 'TypeScript'), order: 2, dependsOn: ['c1'] },
  ],
  createdAt: new Date('2026-01-01'),
});

describe('RefreshResourcesUseCase', () => {
  let roadmapRepo: FakeRoadmapRepository;
  let resourceRepo: FakeResourceRepository;
  let discoveryService: FakeResourceDiscoveryService;
  let useCase: RefreshResourcesUseCase;

  beforeEach(() => {
    roadmapRepo = new FakeRoadmapRepository();
    resourceRepo = new FakeResourceRepository();
    discoveryService = new FakeResourceDiscoveryService();
    roadmapRepo.seed(ROADMAP);
    discoveryService.setResults([
      {
        title: 'MDN JavaScript',
        url: 'https://mdn.io/js',
        type: ResourceType.ARTICLE,
        description: 'MDN docs',
      },
    ]);
    useCase = new RefreshResourcesUseCase(
      roadmapRepo,
      resourceRepo,
      discoveryService,
    );
  });

  describe('refreshing all concepts', () => {
    it('discovers resources for each step and saves them', async () => {
      const result = await useCase.execute({ roadmapId: 'r1' });

      expect(result.conceptsProcessed).toBe(2);
      expect(result.resourcesRefreshed).toBe(2); // 1 per concept
      const saved = await resourceRepo.findByRoadmapId('r1');
      expect(saved).toHaveLength(2);
    });

    it('deletes old resources before refreshing', async () => {
      resourceRepo.seed(
        Resource.create({
          title: 'Old',
          url: 'https://old.com',
          type: ResourceType.ARTICLE,
          conceptId: 'c1',
          roadmapId: 'r1',
          order: 0,
        }),
      );

      await useCase.execute({ roadmapId: 'r1' });

      const saved = await resourceRepo.findByRoadmapId('r1');
      expect(saved.every((r) => r.title === 'MDN JavaScript')).toBe(true);
    });
  });

  describe('refreshing specific concepts', () => {
    it('only processes the specified concepts', async () => {
      const result = await useCase.execute({
        roadmapId: 'r1',
        conceptIds: ['c1'],
      });

      expect(result.conceptsProcessed).toBe(1);
      expect(result.resourcesRefreshed).toBe(1);
    });

    it('returns zero when no concepts match', async () => {
      const result = await useCase.execute({
        roadmapId: 'r1',
        conceptIds: ['nonexistent'],
      });

      expect(result.conceptsProcessed).toBe(0);
      expect(result.resourcesRefreshed).toBe(0);
    });
  });

  describe('when roadmap does not exist', () => {
    it('throws an error', async () => {
      await expect(
        useCase.execute({ roadmapId: 'nonexistent' }),
      ).rejects.toThrow('not found');
    });
  });
});
