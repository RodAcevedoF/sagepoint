import type { ReviewCard, ReviewSource } from '@sagepoint/domain';
import type { ReviewQueueItem } from '@/features/review/app/usecases/get-review-queue.usecase';

export const REVIEW_SERVICE = Symbol('REVIEW_SERVICE');

export interface ReviewQueueQuery {
  source?: ReviewSource;
  sourceId?: string;
  limit?: number;
}

export interface ReviewCountQuery {
  source?: ReviewSource;
  sourceId?: string;
}

export interface IReviewService {
  getDueQueue(
    userId: string,
    query: ReviewQueueQuery,
  ): Promise<ReviewQueueItem[]>;
  countDue(userId: string, query: ReviewCountQuery): Promise<{ count: number }>;
  grade(userId: string, cardId: string, quality: number): Promise<ReviewCard>;
}
