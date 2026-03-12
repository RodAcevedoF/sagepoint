import { GetDocumentQuizUseCase } from '../../../src/features/document/app/usecases/get-document-quiz.usecase';
import { Quiz } from '@sagepoint/domain';
import { FakeQuizRepository } from '../_fakes/repositories';

const FIXED_DATE = new Date('2026-01-01');

describe('GetDocumentQuizUseCase', () => {
  let quizRepo: FakeQuizRepository;
  let useCase: GetDocumentQuizUseCase;

  beforeEach(() => {
    quizRepo = new FakeQuizRepository();
    useCase = new GetDocumentQuizUseCase(quizRepo);
  });

  it('returns quizzes for a given document', async () => {
    quizRepo.seed(
      new Quiz('q1', 'doc1', 'Quiz 1', 5, FIXED_DATE, FIXED_DATE),
      new Quiz('q2', 'doc1', 'Quiz 2', 3, FIXED_DATE, FIXED_DATE),
      new Quiz('q3', 'doc2', 'Other Doc Quiz', 4, FIXED_DATE, FIXED_DATE),
    );

    const result = await useCase.execute('doc1');

    expect(result).toHaveLength(2);
    expect(result.every((q) => q.documentId === 'doc1')).toBe(true);
  });

  it('returns empty array when document has no quizzes', async () => {
    const result = await useCase.execute('no-quizzes');

    expect(result).toEqual([]);
  });
});
