import type { Document, IDocumentRepository } from '@sagepoint/domain';

export class GetUserDocumentsUseCase {
  constructor(private readonly documentRepository: IDocumentRepository) {}

  async execute(userId: string): Promise<Document[]> {
    return await this.documentRepository.findByUserId(userId);
  }
}
