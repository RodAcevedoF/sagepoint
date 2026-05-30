import type { ReviewCard, ReviewSource } from "../entities/review-card.entity";

export const REVIEW_CARD_REPOSITORY = Symbol("REVIEW_CARD_REPOSITORY");

export interface IReviewCardRepository {
  save(card: ReviewCard): Promise<void>;
  findById(id: string): Promise<ReviewCard | null>;
  findByUserAndQuestion(
    userId: string,
    source: ReviewSource,
    questionId: string,
  ): Promise<ReviewCard | null>;
  findDueByUser(
    userId: string,
    now: Date,
    limit: number,
  ): Promise<ReviewCard[]>;
  findDueByUserAndSource(
    userId: string,
    source: ReviewSource,
    sourceId: string,
    now: Date,
    limit: number,
  ): Promise<ReviewCard[]>;
  countDueByUser(userId: string, now: Date): Promise<number>;
  countDueByUserAndSource(
    userId: string,
    source: ReviewSource,
    sourceId: string,
    now: Date,
  ): Promise<number>;
}
