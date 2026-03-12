import { GetGraphUseCase } from '../../../src/features/roadmap/app/usecases/get-graph.usecase';
import { Concept } from '@sagepoint/domain';
import { FakeConceptRepository } from '../_fakes/repositories';

describe('GetGraphUseCase', () => {
  let conceptRepo: FakeConceptRepository;
  let useCase: GetGraphUseCase;

  beforeEach(() => {
    conceptRepo = new FakeConceptRepository();
    useCase = new GetGraphUseCase(conceptRepo);
  });

  it('returns nodes and edges for a document', async () => {
    conceptRepo.seed(
      Concept.create('c1', 'Intro', 'doc1'),
      Concept.create('c2', 'Advanced', 'doc1'),
      Concept.create('c3', 'Unrelated', 'doc2'),
    );
    conceptRepo.seedRelations(
      { fromId: 'c1', toId: 'c2', type: 'NEXT_STEP' },
    );

    const result = await useCase.execute('doc1');

    expect(result.nodes).toHaveLength(2);
    expect(result.edges).toHaveLength(1);
    expect(result.edges[0]).toEqual({ from: 'c1', to: 'c2', type: 'NEXT_STEP' });
  });

  it('returns empty graph for unknown document', async () => {
    const result = await useCase.execute('unknown');

    expect(result.nodes).toEqual([]);
    expect(result.edges).toEqual([]);
  });
});
