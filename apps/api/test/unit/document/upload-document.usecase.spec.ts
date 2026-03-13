import { UploadDocumentUseCase } from '../../../src/features/document/app/usecases/upload-document.usecase';
import {
  FakeDocumentRepository,
  FakeFileStorage,
  FakeProcessingQueue,
} from '../_fakes/repositories';

describe('UploadDocumentUseCase', () => {
  let documentRepo: FakeDocumentRepository;
  let fileStorage: FakeFileStorage;
  let processingQueue: FakeProcessingQueue;
  let useCase: UploadDocumentUseCase;

  beforeEach(() => {
    documentRepo = new FakeDocumentRepository();
    fileStorage = new FakeFileStorage();
    processingQueue = new FakeProcessingQueue();
    useCase = new UploadDocumentUseCase(
      documentRepo,
      fileStorage,
      processingQueue,
    );
  });

  describe('when uploading a valid document', () => {
    it('stores the file, persists metadata, and enqueues processing', async () => {
      const result = await useCase.execute({
        filename: 'test.pdf',
        mimeType: 'application/pdf',
        userId: 'user1',
        size: 1024,
        fileBuffer: Buffer.from('pdf-content'),
      });

      // File stored
      expect(fileStorage.has(`documents/${result.id}/test.pdf`)).toBe(true);

      // Metadata persisted
      const stored = await documentRepo.findById(result.id);
      expect(stored).not.toBeNull();
      expect(stored!.filename).toBe('test.pdf');
      expect(stored!.userId).toBe('user1');

      // Processing enqueued
      expect(processingQueue.jobs).toHaveLength(1);
      expect(processingQueue.jobs[0].documentId).toBe(result.id);
      expect(processingQueue.jobs[0].mimeType).toBe('application/pdf');
    });

    it('returns a document with PENDING status', async () => {
      const result = await useCase.execute({
        filename: 'report.docx',
        mimeType:
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        userId: 'user1',
        size: 2048,
        fileBuffer: Buffer.from('docx-content'),
      });

      expect(result.status).toBe('PENDING');
    });
  });
});
