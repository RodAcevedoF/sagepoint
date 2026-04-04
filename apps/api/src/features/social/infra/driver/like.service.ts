import type { Roadmap } from '@sagepoint/domain';
import type {
  ILikeService,
  LikeStatusResult,
} from '@/features/social/domain/inbound/like.service';
import type { ToggleLikeUseCase } from '@/features/social/app/usecases/toggle-like.usecase';
import type { GetLikeStatusUseCase } from '@/features/social/app/usecases/get-like-status.usecase';
import type { GetLikedRoadmapsUseCase } from '@/features/social/app/usecases/get-liked-roadmaps.usecase';
import type { GetLikeCountsBatchUseCase } from '@/features/social/app/usecases/get-like-counts-batch.usecase';

export class LikeService implements ILikeService {
  constructor(
    private readonly toggleLikeUseCase: ToggleLikeUseCase,
    private readonly getLikeStatusUseCase: GetLikeStatusUseCase,
    private readonly getLikedRoadmapsUseCase: GetLikedRoadmapsUseCase,
    private readonly getLikeCountsBatchUseCase: GetLikeCountsBatchUseCase,
  ) {}

  async toggleLike(
    userId: string,
    roadmapId: string,
  ): Promise<LikeStatusResult> {
    return this.toggleLikeUseCase.execute(userId, roadmapId);
  }

  async getLikeStatus(
    userId: string,
    roadmapId: string,
  ): Promise<LikeStatusResult> {
    return this.getLikeStatusUseCase.execute(userId, roadmapId);
  }

  async getLikeCountsBatch(
    roadmapIds: string[],
  ): Promise<Record<string, number>> {
    return this.getLikeCountsBatchUseCase.execute(roadmapIds);
  }

  async getLikedRoadmaps(userId: string): Promise<Roadmap[]> {
    return this.getLikedRoadmapsUseCase.execute(userId);
  }
}
