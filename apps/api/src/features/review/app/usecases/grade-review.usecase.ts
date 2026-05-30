import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { type IReviewCardRepository, type ReviewCard } from '@sagepoint/domain';

export interface GradeReviewCommand {
  userId: string;
  cardId: string;
  quality: number;
  now?: Date;
}

export class GradeReviewUseCase {
  constructor(private readonly cardRepository: IReviewCardRepository) {}

  async execute(command: GradeReviewCommand): Promise<ReviewCard> {
    const card = await this.cardRepository.findById(command.cardId);
    if (!card) {
      throw new NotFoundException(`Review card ${command.cardId} not found`);
    }
    if (card.userId !== command.userId) {
      throw new ForbiddenException('Review card does not belong to this user');
    }

    const now = command.now ?? new Date();
    const next = card.review(command.quality, now);
    await this.cardRepository.save(next);
    return next;
  }
}
