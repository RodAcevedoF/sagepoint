import { UpdateVisibilityUseCase } from '../../../src/features/roadmap/app/usecases/update-visibility.usecase';
import { Roadmap, RoadmapVisibility } from '@sagepoint/domain';
import { FakeRoadmapRepository } from '../_fakes/repositories';

function buildRoadmap(id: string, userId: string): Roadmap {
  return new Roadmap({
    id,
    title: `Roadmap ${id}`,
    userId,
    steps: [],
    createdAt: new Date('2026-01-01'),
    visibility: RoadmapVisibility.PRIVATE,
  });
}

describe('UpdateVisibilityUseCase', () => {
  let roadmapRepo: FakeRoadmapRepository;
  let useCase: UpdateVisibilityUseCase;

  beforeEach(() => {
    roadmapRepo = new FakeRoadmapRepository();
    useCase = new UpdateVisibilityUseCase(roadmapRepo);
  });

  describe('when the owner changes visibility', () => {
    it.each([
      { from: RoadmapVisibility.PRIVATE, to: RoadmapVisibility.PUBLIC },
      { from: RoadmapVisibility.PUBLIC, to: RoadmapVisibility.PRIVATE },
    ])('updates from $from to $to', async ({ to }) => {
      roadmapRepo.seed(buildRoadmap('r1', 'user1'));

      const result = await useCase.execute('r1', 'user1', to);

      expect(result.visibility).toBe(to);
    });
  });

  describe('error cases', () => {
    it('throws when roadmap does not exist', async () => {
      await expect(
        useCase.execute('nonexistent', 'user1', RoadmapVisibility.PUBLIC),
      ).rejects.toThrow('Roadmap not found');
    });

    it('throws when user is not the owner', async () => {
      roadmapRepo.seed(buildRoadmap('r1', 'other-user'));

      await expect(
        useCase.execute('r1', 'user1', RoadmapVisibility.PUBLIC),
      ).rejects.toThrow('Not authorized');
    });
  });
});
