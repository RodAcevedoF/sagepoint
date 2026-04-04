import {
  RoadmapVisibility,
  type IRoadmapRepository,
  type IAdoptionRepository,
} from '@sagepoint/domain';
import {
  ForbiddenException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';

export class AdoptRoadmapUseCase {
  constructor(
    private readonly roadmapRepository: IRoadmapRepository,
    private readonly adoptionRepository: IAdoptionRepository,
  ) {}

  async execute(
    userId: string,
    roadmapId: string,
  ): Promise<{ adopted: boolean }> {
    const roadmap = await this.roadmapRepository.findById(roadmapId);
    if (!roadmap) {
      throw new NotFoundException(`Roadmap ${roadmapId} not found`);
    }

    if (roadmap.visibility !== RoadmapVisibility.PUBLIC) {
      throw new ForbiddenException('Can only adopt public roadmaps');
    }

    if (roadmap.userId === userId) {
      throw new ConflictException('Cannot adopt your own roadmap');
    }

    await this.adoptionRepository.adopt(userId, roadmapId);
    return { adopted: true };
  }
}
