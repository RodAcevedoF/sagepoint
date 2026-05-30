import {
  type IReviewCardRepository,
  type ReviewCard,
  type ReviewSource,
} from '@sagepoint/domain';

export interface GetDueCardsQuery {
  userId: string;
  source?: ReviewSource;
  sourceId?: string;
  limit?: number;
  now?: Date;
}

const DEFAULT_LIMIT = 50;

export class GetDueCardsUseCase {
  constructor(private readonly cardRepository: IReviewCardRepository) {}

  async execute(query: GetDueCardsQuery): Promise<ReviewCard[]> {
    const now = query.now ?? new Date();
    const limit = query.limit ?? DEFAULT_LIMIT;

    if (query.source && query.sourceId) {
      return this.cardRepository.findDueByUserAndSource(
        query.userId,
        query.source,
        query.sourceId,
        now,
        limit,
      );
    }

    return this.cardRepository.findDueByUser(query.userId, now, limit);
  }
}
