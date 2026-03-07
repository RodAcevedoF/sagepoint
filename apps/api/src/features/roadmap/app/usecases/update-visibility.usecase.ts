import type {
  IRoadmapRepository,
  Roadmap,
  RoadmapVisibility,
} from '@sagepoint/domain';

export class UpdateVisibilityUseCase {
  constructor(private readonly roadmapRepository: IRoadmapRepository) {}

  async execute(
    id: string,
    userId: string,
    visibility: RoadmapVisibility,
  ): Promise<Roadmap> {
    const roadmap = await this.roadmapRepository.findById(id);
    if (!roadmap) {
      throw new Error('Roadmap not found');
    }
    if (roadmap.userId !== userId) {
      throw new Error('Not authorized to update this roadmap');
    }
    return this.roadmapRepository.updateVisibility(id, visibility);
  }
}
