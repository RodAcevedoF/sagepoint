import type { IDocumentRepository, Document } from '@sagepoint/domain';

export class UpdateFilenameUseCase {
  constructor(private readonly documentRepository: IDocumentRepository) {}

  async execute(
    id: string,
    userId: string,
    filename: string,
  ): Promise<Document> {
    const trimmed = filename.trim();
    if (!trimmed || trimmed.length > 200) {
      throw new Error('Invalid filename');
    }
    const document = await this.documentRepository.findById(id);
    if (!document) {
      throw new Error('Document not found');
    }
    if (document.userId !== userId) {
      throw new Error('Document not found');
    }
    return this.documentRepository.updateFilename(id, trimmed);
  }
}
