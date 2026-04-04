import type { Roadmap } from '@sagepoint/domain';

export const LIKE_SERVICE = Symbol('LIKE_SERVICE');

export interface LikeStatusResult {
  liked: boolean;
  likeCount: number;
}

export interface ILikeService {
  toggleLike(userId: string, roadmapId: string): Promise<LikeStatusResult>;
  getLikeStatus(userId: string, roadmapId: string): Promise<LikeStatusResult>;
  getLikeCountsBatch(roadmapIds: string[]): Promise<Record<string, number>>;
  getLikedRoadmaps(userId: string): Promise<Roadmap[]>;
}
