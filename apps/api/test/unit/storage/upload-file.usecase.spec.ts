import { UploadFileUseCase } from '../../../src/features/storage/app/usecases/upload-file.usecase';
import { BadRequestException } from '@nestjs/common';
import { FakeFileStorage } from '../_fakes/repositories';

describe('UploadFileUseCase', () => {
  let fileStorage: FakeFileStorage;
  let useCase: UploadFileUseCase;

  beforeEach(() => {
    fileStorage = new FakeFileStorage();
    useCase = new UploadFileUseCase(fileStorage);
  });

  describe('valid uploads', () => {
    it.each([
      {
        category: 'avatars' as const,
        mimeType: 'image/png',
        filename: 'avatar.png',
      },
      {
        category: 'documents' as const,
        mimeType: 'application/pdf',
        filename: 'doc.pdf',
      },
      {
        category: 'roadmaps' as const,
        mimeType: 'application/json',
        filename: 'data.json',
      },
    ])(
      'uploads a $category file successfully',
      async ({ category, mimeType, filename }) => {
        const result = await useCase.execute({
          content: Buffer.from('file-content'),
          filename,
          mimeType,
          category,
          userId: 'user1',
        });

        expect(result.path).toContain(category);
        expect(result.path).toContain('user1');
      },
    );

    it('generates a unique storage path', async () => {
      const result1 = await useCase.execute({
        content: Buffer.from('a'),
        filename: 'file.png',
        mimeType: 'image/png',
        category: 'avatars',
      });
      const result2 = await useCase.execute({
        content: Buffer.from('b'),
        filename: 'file.png',
        mimeType: 'image/png',
        category: 'avatars',
      });

      expect(result1.path).not.toBe(result2.path);
    });
  });

  describe('MIME type validation', () => {
    it('rejects disallowed MIME types', async () => {
      await expect(
        useCase.execute({
          content: Buffer.from('x'),
          filename: 'exploit.exe',
          mimeType: 'application/x-msdownload',
          category: 'avatars',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('allows any MIME type for temp category', async () => {
      const result = await useCase.execute({
        content: Buffer.from('x'),
        filename: 'any.bin',
        mimeType: 'application/octet-stream',
        category: 'temp',
      });

      expect(result.path).toContain('temp');
    });
  });

  describe('file size validation', () => {
    it('rejects files exceeding the category limit', async () => {
      const largeBuffer = Buffer.alloc(6 * 1024 * 1024); // 6MB > 5MB avatar limit

      await expect(
        useCase.execute({
          content: largeBuffer,
          filename: 'big.png',
          mimeType: 'image/png',
          category: 'avatars',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
