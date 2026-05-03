import type {
  IRoadmapRepository,
  Roadmap,
  ICacheService,
} from '@sagepoint/domain';

export class UpdateTitleUseCase {
  constructor(
    private readonly roadmapRepository: IRoadmapRepository,
    private readonly cache?: ICacheService,
  ) {}

  async execute(id: string, userId: string, title: string): Promise<Roadmap> {
    const trimmed = title.trim();
    if (!trimmed || trimmed.length > 200) {
      throw new Error('Invalid title');
    }
    const roadmap = await this.roadmapRepository.findById(id);
    if (!roadmap) {
      throw new Error('Roadmap not found');
    }
    if (roadmap.userId !== userId) {
      throw new Error('Not authorized to update this roadmap');
    }
    const updated = await this.roadmapRepository.updateTitle(id, trimmed);
    await this.cache?.delByPattern('category-rooms:*');
    return updated;
  }
}
