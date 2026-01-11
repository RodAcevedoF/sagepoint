import { Document } from '@sagepoint/domain';
import { IDocumentRepository } from '@sagepoint/domain';

export class GetDocumentUseCase {
  constructor(private readonly documentRepository: IDocumentRepository) {}

  async execute(id: string): Promise<Document | null> {
    return await this.documentRepository.findById(id);
  }

  async listAll(): Promise<Document[]> {
    return await this.documentRepository.findAll();
  }
}
