import { GetDocumentUseCase } from '../../../src/features/document/app/usecases/get-document.usecase';
import { Document } from '@sagepoint/domain';
import { FakeDocumentRepository } from '../_fakes/repositories';

describe('GetDocumentUseCase', () => {
  let documentRepo: FakeDocumentRepository;
  let useCase: GetDocumentUseCase;

  beforeEach(() => {
    documentRepo = new FakeDocumentRepository();
    useCase = new GetDocumentUseCase(documentRepo);
    documentRepo.seed(
      Document.create('doc1', 'a.pdf', 'path/a.pdf', 'user1'),
      Document.create('doc2', 'b.pdf', 'path/b.pdf', 'user2'),
    );
  });

  describe('execute (by id)', () => {
    it('returns the document when it exists', async () => {
      const result = await useCase.execute('doc1');

      expect(result).not.toBeNull();
      expect(result!.filename).toBe('a.pdf');
    });

    it('returns null when document does not exist', async () => {
      const result = await useCase.execute('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('listAll', () => {
    it('returns all documents', async () => {
      const result = await useCase.listAll();

      expect(result).toHaveLength(2);
    });
  });
});
