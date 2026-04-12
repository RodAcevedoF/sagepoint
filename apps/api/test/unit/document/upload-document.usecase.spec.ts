import { UploadDocumentUseCase } from '../../../src/features/document/app/usecases/upload-document.usecase';
import { User, UserRole } from '@sagepoint/domain';
import {
  FakeDocumentRepository,
  FakeFileStorage,
  FakeProcessingQueue,
  FakeTokenBalanceRepository,
  FakeUserRepository,
} from '../_fakes/repositories';

describe('UploadDocumentUseCase', () => {
  let documentRepo: FakeDocumentRepository;
  let fileStorage: FakeFileStorage;
  let processingQueue: FakeProcessingQueue;
  let tokenBalanceRepo: FakeTokenBalanceRepository;
  let userRepo: FakeUserRepository;
  let useCase: UploadDocumentUseCase;

  const testUser = User.create(
    '00000000-0000-0000-0000-000000000001',
    'test@example.com',
    'Test User',
    UserRole.USER,
  );

  beforeEach(() => {
    documentRepo = new FakeDocumentRepository();
    fileStorage = new FakeFileStorage();
    processingQueue = new FakeProcessingQueue();
    tokenBalanceRepo = new FakeTokenBalanceRepository();
    userRepo = new FakeUserRepository();
    userRepo.seed(testUser);
    useCase = new UploadDocumentUseCase(
      documentRepo,
      fileStorage,
      processingQueue,
      tokenBalanceRepo,
      userRepo,
    );
  });

  describe('when uploading a valid document', () => {
    it('stores the file, persists metadata, and enqueues processing', async () => {
      const result = await useCase.execute({
        filename: 'test.pdf',
        mimeType: 'application/pdf',
        userId: '00000000-0000-0000-0000-000000000001',
        size: 1024,
        fileBuffer: Buffer.from('pdf-content'),
      });

      // File stored
      expect(fileStorage.has(`documents/${result.id}/test.pdf`)).toBe(true);

      // Metadata persisted
      const stored = await documentRepo.findById(result.id);
      expect(stored).not.toBeNull();
      expect(stored!.filename).toBe('test.pdf');
      expect(stored!.userId).toBe('00000000-0000-0000-0000-000000000001');

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
        userId: '00000000-0000-0000-0000-000000000001',
        size: 2048,
        fileBuffer: Buffer.from('docx-content'),
      });

      expect(result.status).toBe('PENDING');
    });
  });
});
