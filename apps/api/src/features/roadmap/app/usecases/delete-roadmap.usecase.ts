import type { IRoadmapRepository } from '@sagepoint/domain';

export class DeleteRoadmapUseCase {
  constructor(private readonly roadmapRepository: IRoadmapRepository) {}

  async execute(id: string, userId: string): Promise<void> {
    const roadmap = await this.roadmapRepository.findById(id);
    if (!roadmap) {
      throw new Error('Roadmap not found');
    }
    if (roadmap.userId !== userId) {
      throw new Error('Not authorized to delete this roadmap');
    }
    return this.roadmapRepository.delete(id);
  }
}
