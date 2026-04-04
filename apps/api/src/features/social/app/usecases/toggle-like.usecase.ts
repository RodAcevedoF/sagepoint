import { RoadmapVisibility, type ILikeRepository } from '@sagepoint/domain';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import type { IRoadmapService } from '@/features/roadmap/domain/inbound/roadmap.service';
import type { LikeStatusResult } from '@/features/social/domain/inbound/like.service';

export class ToggleLikeUseCase {
  constructor(
    private readonly likeRepository: ILikeRepository,
    private readonly roadmapService: IRoadmapService,
  ) {}

  async execute(userId: string, roadmapId: string): Promise<LikeStatusResult> {
    const roadmap = await this.roadmapService.findById(roadmapId);
    if (!roadmap) {
      throw new NotFoundException(`Roadmap ${roadmapId} not found`);
    }

    if (
      roadmap.visibility !== RoadmapVisibility.PUBLIC &&
      roadmap.userId !== userId
    ) {
      throw new ForbiddenException('Cannot like a private roadmap');
    }

    const alreadyLiked = await this.likeRepository.isLiked(userId, roadmapId);

    if (alreadyLiked) {
      await this.likeRepository.unlike(userId, roadmapId);
    } else {
      await this.likeRepository.like(userId, roadmapId);
    }

    const likeCount = await this.likeRepository.getLikeCount(roadmapId);
    return { liked: !alreadyLiked, likeCount };
  }
}
