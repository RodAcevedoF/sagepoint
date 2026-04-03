import { DeleteRoadmapUseCase } from '../../../src/features/roadmap/app/usecases/delete-roadmap.usecase';
import { Roadmap } from '@sagepoint/domain';
import { FakeRoadmapRepository } from '../_fakes/repositories';

const OWNER_ID = '00000000-0000-0000-0000-000000000001';
const OTHER_ID = '00000000-0000-0000-0000-000000000002';

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
        userId: OWNER_ID,
        steps: [],
        createdAt: new Date('2026-01-01'),
      }),
    );

    await useCase.execute('r1', OWNER_ID);

    expect(await roadmapRepo.findById('r1')).toBeNull();
  });

  it('throws when roadmap does not exist', async () => {
    await expect(useCase.execute('nonexistent', OWNER_ID)).rejects.toThrow(
      'Roadmap not found',
    );
  });

  it('throws when user does not own the roadmap', async () => {
    roadmapRepo.seed(
      new Roadmap({
        id: 'r1',
        title: 'Not Yours',
        userId: OWNER_ID,
        steps: [],
        createdAt: new Date('2026-01-01'),
      }),
    );

    await expect(useCase.execute('r1', OTHER_ID)).rejects.toThrow(
      'Not authorized to delete this roadmap',
    );
    expect(await roadmapRepo.findById('r1')).not.toBeNull();
  });
});
