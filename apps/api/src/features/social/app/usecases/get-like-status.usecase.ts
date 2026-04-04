import type { ILikeRepository } from '@sagepoint/domain';
import type { LikeStatusResult } from '@/features/social/domain/inbound/like.service';

export class GetLikeStatusUseCase {
  constructor(private readonly likeRepository: ILikeRepository) {}

  async execute(userId: string, roadmapId: string): Promise<LikeStatusResult> {
    const [liked, likeCount] = await Promise.all([
      this.likeRepository.isLiked(userId, roadmapId),
      this.likeRepository.getLikeCount(roadmapId),
    ]);
    return { liked, likeCount };
  }
}
