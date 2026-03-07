import type { IRoadmapRepository, Roadmap } from '@sagepoint/domain';

export class GetPublicRoadmapsUseCase {
  constructor(private readonly roadmapRepository: IRoadmapRepository) {}

  async execute(): Promise<Roadmap[]> {
    return this.roadmapRepository.findPublic();
  }
}
