import { DeleteRoadmapUseCase } from '../../../src/features/roadmap/app/usecases/delete-roadmap.usecase';
import { Roadmap } from '@sagepoint/domain';
import { FakeRoadmapRepository } from '../_fakes/repositories';

describe('DeleteRoadmapUseCase', () => {
  let roadmapRepo: FakeRoadmapRepository;
  let useCase: DeleteRoadmapUseCase;

  beforeEach(() => {
    roadmapRepo = new FakeRoadmapRepository();
    useCase = new DeleteRoadmapUseCase(roadmapRepo);
  });

  it('removes the roadmap from the repository', async () => {
    roadmapRepo.seed(
      new Roadmap({
        id: 'r1',
        title: 'To Delete',
        steps: [],
        createdAt: new Date('2026-01-01'),
      }),
    );

    await useCase.execute('r1');

    expect(await roadmapRepo.findById('r1')).toBeNull();
  });

  it('does not throw when roadmap does not exist', async () => {
    await expect(useCase.execute('nonexistent')).resolves.not.toThrow();
  });
});
