import type { ILikeService } from '@/features/social/domain/inbound/like.service';
import type { IRoadmapService } from '@/features/roadmap/domain/inbound/roadmap.service';
import type { PrismaClient } from '@sagepoint/database';
import { LikeService } from '@/features/social/infra/driver/like.service';
import { ToggleLikeUseCase } from './app/usecases/toggle-like.usecase';
import { GetLikeStatusUseCase } from './app/usecases/get-like-status.usecase';
import { GetLikedRoadmapsUseCase } from './app/usecases/get-liked-roadmaps.usecase';
import { GetLikeCountsBatchUseCase } from './app/usecases/get-like-counts-batch.usecase';
import { PrismaLikeRepository } from '@sagepoint/database';

export interface SocialDependencies {
  likeService: ILikeService;
}

export function makeSocialDependencies(
  prismaService: PrismaClient,
  roadmapService: IRoadmapService,
): SocialDependencies {
  const likeRepository = new PrismaLikeRepository(prismaService);

  const toggleLikeUseCase = new ToggleLikeUseCase(
    likeRepository,
    roadmapService,
  );
  const getLikeStatusUseCase = new GetLikeStatusUseCase(likeRepository);
  const getLikedRoadmapsUseCase = new GetLikedRoadmapsUseCase(
    likeRepository,
    roadmapService,
  );
  const getLikeCountsBatchUseCase = new GetLikeCountsBatchUseCase(
    likeRepository,
  );

  const likeService = new LikeService(
    toggleLikeUseCase,
    getLikeStatusUseCase,
    getLikedRoadmapsUseCase,
    getLikeCountsBatchUseCase,
  );

  return {
    likeService,
  };
}
