import { IConceptRepository, Concept } from '@sagepoint/domain';

export class GetGraphUseCase {
  constructor(private readonly conceptRepository: IConceptRepository) {}

  async execute(documentId: string): Promise<{ nodes: Concept[]; edges: { from: string; to: string; type: string }[] }> {
    return await this.conceptRepository.getGraphByDocumentId(documentId);
  }
}
