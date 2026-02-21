import type { IDocumentRepository, IFileStorage } from '@sagepoint/domain';
import { NotFoundException } from '@nestjs/common';

export class DeleteDocumentUseCase {
  constructor(
    private readonly documentRepository: IDocumentRepository,
    private readonly fileStorage: IFileStorage,
  ) {}

  async execute(id: string, userId: string): Promise<void> {
    const document = await this.documentRepository.findById(id);
    if (!document) {
      throw new NotFoundException(`Document ${id} not found`);
    }
    if (document.userId !== userId) {
      throw new NotFoundException(`Document ${id} not found`);
    }

    await this.fileStorage.delete(document.storagePath);
    await this.documentRepository.delete(id);
  }
}
