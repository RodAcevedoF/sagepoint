import type { ReviewCard } from '@sagepoint/domain';
import type {
  IReviewService,
  ReviewQueueQuery,
  ReviewCountQuery,
} from '@/features/review/domain/inbound/review.service';
import type {
  GetReviewQueueUseCase,
  ReviewQueueItem,
} from '@/features/review/app/usecases/get-review-queue.usecase';
import type { CountDueCardsUseCase } from '@/features/review/app/usecases/count-due-cards.usecase';
import type { GradeReviewUseCase } from '@/features/review/app/usecases/grade-review.usecase';

export class ReviewService implements IReviewService {
  constructor(
    private readonly getReviewQueueUseCase: GetReviewQueueUseCase,
    private readonly countDueCardsUseCase: CountDueCardsUseCase,
    private readonly gradeReviewUseCase: GradeReviewUseCase,
  ) {}

  getDueQueue(
    userId: string,
    query: ReviewQueueQuery,
  ): Promise<ReviewQueueItem[]> {
    return this.getReviewQueueUseCase.execute({
      userId,
      source: query.source,
      sourceId: query.sourceId,
      limit: query.limit,
    });
  }

  async countDue(
    userId: string,
    query: ReviewCountQuery,
  ): Promise<{ count: number }> {
    const count = await this.countDueCardsUseCase.execute({
      userId,
      source: query.source,
      sourceId: query.sourceId,
    });
    return { count };
  }

  grade(userId: string, cardId: string, quality: number): Promise<ReviewCard> {
    return this.gradeReviewUseCase.execute({ userId, cardId, quality });
  }
}
