import { GetUserDocumentsUseCase } from '../../../src/features/document/app/usecases/get-user-documents.usecase';
import { Document } from '@sagepoint/domain';
import { FakeDocumentRepository } from '../_fakes/repositories';

describe('GetUserDocumentsUseCase', () => {
  let documentRepo: FakeDocumentRepository;
  let useCase: GetUserDocumentsUseCase;

  beforeEach(() => {
    documentRepo = new FakeDocumentRepository();
    useCase = new GetUserDocumentsUseCase(documentRepo);
  });

  describe('execute', () => {
    it('returns only documents belonging to the given user', async () => {
      documentRepo.seed(
        Document.create('d1', 'a.pdf', 'path/a.pdf', 'user1'),
        Document.create('d2', 'b.pdf', 'path/b.pdf', 'user1'),
        Document.create('d3', 'c.pdf', 'path/c.pdf', 'user2'),
      );

      const result = await useCase.execute('user1');

      expect(result).toHaveLength(2);
      expect(result.every((d) => d.userId === 'user1')).toBe(true);
    });

    it('returns an empty array when user has no documents', async () => {
      const result = await useCase.execute('user-no-docs');

      expect(result).toEqual([]);
    });
  });

  describe('executeCursor', () => {
    it('returns paginated results', async () => {
      documentRepo.seed(Document.create('d1', 'a.pdf', 'path/a.pdf', 'user1'));

      const result = await useCase.executeCursor('user1', { limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.hasMore).toBe(false);
    });
  });
});
