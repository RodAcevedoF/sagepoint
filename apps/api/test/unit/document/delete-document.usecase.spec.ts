import { DeleteDocumentUseCase } from '../../../src/features/document/app/usecases/delete-document.usecase';
import { Document } from '@sagepoint/domain';
import { NotFoundException } from '@nestjs/common';
import {
  FakeDocumentRepository,
  FakeFileStorage,
} from '../_fakes/repositories';

function buildDocument(id: string, userId: string) {
  return Document.create(id, 'file.pdf', `documents/${id}/file.pdf`, userId);
}

describe('DeleteDocumentUseCase', () => {
  let documentRepo: FakeDocumentRepository;
  let fileStorage: FakeFileStorage;
  let useCase: DeleteDocumentUseCase;

  beforeEach(() => {
    documentRepo = new FakeDocumentRepository();
    fileStorage = new FakeFileStorage();
    useCase = new DeleteDocumentUseCase(documentRepo, fileStorage);
  });

  describe('when the owner deletes their document', () => {
    it('removes the file from storage and the document from the repository', async () => {
      const doc = buildDocument('doc1', 'user1');
      documentRepo.seed(doc);
      await fileStorage.upload(
        'documents/doc1/file.pdf',
        Buffer.from('content'),
      );

      await useCase.execute('doc1', 'user1');

      expect(await documentRepo.findById('doc1')).toBeNull();
      expect(fileStorage.has('documents/doc1/file.pdf')).toBe(false);
    });
  });

  describe('when the document does not exist', () => {
    it('throws NotFoundException', async () => {
      await expect(useCase.execute('nonexistent', 'user1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('when the user does not own the document', () => {
    it('throws NotFoundException and does not delete the file', async () => {
      documentRepo.seed(buildDocument('doc1', 'other-user'));
      await fileStorage.upload('documents/doc1/file.pdf', Buffer.from('x'));

      await expect(useCase.execute('doc1', 'user1')).rejects.toThrow(
        NotFoundException,
      );
      expect(fileStorage.has('documents/doc1/file.pdf')).toBe(true);
    });
  });
});
