import type { IRoadmapRepository, Roadmap } from '@sagepoint/domain';

export class SearchPublicRoadmapsUseCase {
  constructor(private readonly roadmapRepository: IRoadmapRepository) {}

  async execute(query: string, limit = 5): Promise<Roadmap[]> {
    const trimmed = query.trim();
    if (!trimmed) return [];
    return this.roadmapRepository.searchPublic(trimmed, limit);
  }
}
