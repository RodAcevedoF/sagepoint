import { GetDocumentSummaryUseCase } from '../../../src/features/document/app/usecases/get-document-summary.usecase';
import { DocumentSummary } from '@sagepoint/domain';
import { FakeDocumentSummaryRepository } from '../_fakes/repositories';

const FIXED_DATE = new Date('2026-01-01');

describe('GetDocumentSummaryUseCase', () => {
  let summaryRepo: FakeDocumentSummaryRepository;
  let useCase: GetDocumentSummaryUseCase;

  beforeEach(() => {
    summaryRepo = new FakeDocumentSummaryRepository();
    useCase = new GetDocumentSummaryUseCase(summaryRepo);
  });

  it('returns the summary when it exists', async () => {
    summaryRepo.seed(
      new DocumentSummary(
        's1',
        'doc1',
        'An overview of the document',
        ['Point 1', 'Point 2'],
        'Computer Science',
        'intermediate',
        5,
        FIXED_DATE,
      ),
    );

    const result = await useCase.execute('doc1');

    expect(result).not.toBeNull();
    expect(result!.overview).toBe('An overview of the document');
    expect(result!.keyPoints).toHaveLength(2);
  });

  it('returns null when no summary exists', async () => {
    const result = await useCase.execute('no-summary');

    expect(result).toBeNull();
  });
});
