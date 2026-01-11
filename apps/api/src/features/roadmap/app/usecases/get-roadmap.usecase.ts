import type { Roadmap } from '@sagepoint/domain';
import type { IRoadmapRepository } from '@sagepoint/domain';

export class GetRoadmapUseCase {
  constructor(private readonly roadmapRepository: IRoadmapRepository) {}

  async execute(id: string): Promise<Roadmap | null> {
    return this.roadmapRepository.findById(id);
  }

  async byDocumentId(documentId: string): Promise<Roadmap[]> {
    return this.roadmapRepository.findByDocumentId(documentId);
  }
}
