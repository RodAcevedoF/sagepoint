import { GetRoadmapUseCase } from '../../../src/features/roadmap/app/usecases/get-roadmap.usecase';
import { Roadmap, RoadmapVisibility } from '@sagepoint/domain';
import { FakeRoadmapRepository } from '../_fakes/repositories';

describe('GetRoadmapUseCase', () => {
  let roadmapRepo: FakeRoadmapRepository;
  let useCase: GetRoadmapUseCase;

  beforeEach(() => {
    roadmapRepo = new FakeRoadmapRepository();
    useCase = new GetRoadmapUseCase(roadmapRepo);
    roadmapRepo.seed(
      new Roadmap({
        id: 'r1',
        title: 'Roadmap 1',
        documentId: 'doc1',
        userId: 'user1',
        steps: [],
        createdAt: new Date('2026-01-01'),
      }),
      new Roadmap({
        id: 'r2',
        title: 'Roadmap 2',
        documentId: 'doc1',
        userId: 'user1',
        steps: [],
        createdAt: new Date('2026-01-02'),
      }),
    );
  });

  describe('execute (by id)', () => {
    it('returns the roadmap when found', async () => {
      const result = await useCase.execute('r1');

      expect(result).not.toBeNull();
      expect(result!.title).toBe('Roadmap 1');
    });

    it('returns null when not found', async () => {
      const result = await useCase.execute('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('byDocumentId', () => {
    it('returns all roadmaps for a document', async () => {
      const result = await useCase.byDocumentId('doc1');

      expect(result).toHaveLength(2);
    });

    it('returns empty array when document has no roadmaps', async () => {
      const result = await useCase.byDocumentId('no-roadmaps');

      expect(result).toEqual([]);
    });
  });
});
