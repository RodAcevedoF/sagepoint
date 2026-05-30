import { randomUUID } from 'crypto';
import {
  ReviewCard,
  ReviewSource,
  type IReviewCardRepository,
} from '@sagepoint/domain';

export interface ScheduleReviewCommand {
  userId: string;
  source: ReviewSource;
  sourceId: string;
  questionId: string;
  quality: number;
  now?: Date;
}

export class ScheduleReviewUseCase {
  constructor(private readonly cardRepository: IReviewCardRepository) {}

  async execute(command: ScheduleReviewCommand): Promise<ReviewCard> {
    const now = command.now ?? new Date();
    const existing = await this.cardRepository.findByUserAndQuestion(
      command.userId,
      command.source,
      command.questionId,
    );

    const next = existing
      ? existing.review(command.quality, now)
      : ReviewCard.schedule(
          randomUUID(),
          command.userId,
          command.source,
          command.sourceId,
          command.questionId,
          command.quality,
          now,
        );

    await this.cardRepository.save(next);
    return next;
  }
}
