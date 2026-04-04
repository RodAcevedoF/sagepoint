export const LIKE_REPOSITORY = Symbol("LIKE_REPOSITORY");

export interface ILikeRepository {
  like(userId: string, roadmapId: string): Promise<void>;
  unlike(userId: string, roadmapId: string): Promise<void>;
  isLiked(userId: string, roadmapId: string): Promise<boolean>;
  getLikeCount(roadmapId: string): Promise<number>;
  getLikeCountsBatch(roadmapIds: string[]): Promise<Record<string, number>>;
  getLikedRoadmapIds(userId: string): Promise<string[]>;
}
