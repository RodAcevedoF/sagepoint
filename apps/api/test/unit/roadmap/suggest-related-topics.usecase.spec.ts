import { SuggestRelatedTopicsUseCase } from '../../../src/features/roadmap/app/usecases/suggest-related-topics.usecase';
import { Roadmap, Concept } from '@sagepoint/domain';
import {
  FakeRoadmapRepository,
  FakeConceptRepository,
} from '../_fakes/repositories';

describe('SuggestRelatedTopicsUseCase', () => {
  let roadmapRepo: FakeRoadmapRepository;
  let conceptRepo: FakeConceptRepository;
  let useCase: SuggestRelatedTopicsUseCase;

  beforeEach(() => {
    roadmapRepo = new FakeRoadmapRepository();
    conceptRepo = new FakeConceptRepository();
    useCase = new SuggestRelatedTopicsUseCase(roadmapRepo, conceptRepo);
  });

  describe('when roadmap has related concepts in the graph', () => {
    it('returns suggestions not already in the roadmap', async () => {
      roadmapRepo.seed(
        new Roadmap({
          id: 'r1',
          title: 'Test',
          steps: [
            { concept: Concept.create('c1', 'JavaScript'), order: 1, dependsOn: [] },
          ],
          createdAt: new Date('2026-01-01'),
        }),
      );
      // c2 is related to c1 via graph but not in the roadmap
      conceptRepo.seed(
        Concept.create('c1', 'JavaScript'),
        Concept.create('c2', 'TypeScript', undefined, 'Typed JS'),
      );
      conceptRepo.seedRelations({ fromId: 'c1', toId: 'c2', type: 'RELATED_TO' });

      const result = await useCase.execute('r1');

      expect(result).toHaveLength(1);
      expect(result[0].concept.name).toBe('TypeScript');
    });
  });

  describe('when roadmap has no steps', () => {
    it('returns empty array', async () => {
      roadmapRepo.seed(
        new Roadmap({ id: 'r1', title: 'Empty', steps: [], createdAt: new Date('2026-01-01') }),
      );

      const result = await useCase.execute('r1');

      expect(result).toEqual([]);
    });
  });

  describe('when roadmap does not exist', () => {
    it('throws an error', async () => {
      await expect(useCase.execute('nonexistent')).rejects.toThrow('not found');
    });
  });
});
