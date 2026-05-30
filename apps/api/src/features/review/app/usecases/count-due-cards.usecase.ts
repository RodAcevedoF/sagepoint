import {
  type IReviewCardRepository,
  type ReviewSource,
} from '@sagepoint/domain';

export interface CountDueCardsQuery {
  userId: string;
  source?: ReviewSource;
  sourceId?: string;
  now?: Date;
}

export class CountDueCardsUseCase {
  constructor(private readonly cardRepository: IReviewCardRepository) {}

  async execute(query: CountDueCardsQuery): Promise<number> {
    const now = query.now ?? new Date();

    if (query.source && query.sourceId) {
      return this.cardRepository.countDueByUserAndSource(
        query.userId,
        query.source,
        query.sourceId,
        now,
      );
    }

    return this.cardRepository.countDueByUser(query.userId, now);
  }
}
