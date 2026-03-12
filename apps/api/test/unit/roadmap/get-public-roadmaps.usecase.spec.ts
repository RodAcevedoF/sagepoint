import { GetPublicRoadmapsUseCase } from '../../../src/features/roadmap/app/usecases/get-public-roadmaps.usecase';
import { Roadmap, RoadmapVisibility } from '@sagepoint/domain';
import { FakeRoadmapRepository } from '../_fakes/repositories';

describe('GetPublicRoadmapsUseCase', () => {
  let roadmapRepo: FakeRoadmapRepository;
  let useCase: GetPublicRoadmapsUseCase;

  beforeEach(() => {
    roadmapRepo = new FakeRoadmapRepository();
    useCase = new GetPublicRoadmapsUseCase(roadmapRepo);
  });

  it('returns only public roadmaps', async () => {
    roadmapRepo.seed(
      new Roadmap({
        id: 'r1',
        title: 'Public',
        steps: [],
        visibility: RoadmapVisibility.PUBLIC,
        createdAt: new Date('2026-01-01'),
      }),
      new Roadmap({
        id: 'r2',
        title: 'Private',
        steps: [],
        visibility: RoadmapVisibility.PRIVATE,
        createdAt: new Date('2026-01-01'),
      }),
    );

    const result = await useCase.execute();

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Public');
  });

  it('returns empty array when no public roadmaps exist', async () => {
    const result = await useCase.execute();

    expect(result).toEqual([]);
  });
});
