import {
  ReviewCard,
  ReviewSource,
  type IReviewCardRepository,
} from "@sagepoint/domain";
import type {
  PrismaClient,
  ReviewCard as PrismaReviewCard,
} from "../generated/prisma/client";

export class PrismaReviewCardRepository implements IReviewCardRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(card: ReviewCard): Promise<void> {
    await this.prisma.reviewCard.upsert({
      where: { id: card.id },
      create: {
        id: card.id,
        userId: card.userId,
        source: card.source,
        sourceId: card.sourceId,
        questionId: card.questionId,
        interval: card.interval,
        easeFactor: card.easeFactor,
        repetitions: card.repetitions,
        lapses: card.lapses,
        dueAt: card.dueAt,
        lastReviewedAt: card.lastReviewedAt ?? null,
        createdAt: card.createdAt,
        updatedAt: card.updatedAt,
      },
      update: {
        interval: card.interval,
        easeFactor: card.easeFactor,
        repetitions: card.repetitions,
        lapses: card.lapses,
        dueAt: card.dueAt,
        lastReviewedAt: card.lastReviewedAt ?? null,
        updatedAt: card.updatedAt,
      },
    });
  }

  async findById(id: string): Promise<ReviewCard | null> {
    const data = await this.prisma.reviewCard.findUnique({ where: { id } });
    return data ? this.mapToDomain(data) : null;
  }

  async findByUserAndQuestion(
    userId: string,
    source: ReviewSource,
    questionId: string,
  ): Promise<ReviewCard | null> {
    const data = await this.prisma.reviewCard.findUnique({
      where: {
        userId_source_questionId: { userId, source, questionId },
      },
    });
    return data ? this.mapToDomain(data) : null;
  }

  async findDueByUser(
    userId: string,
    now: Date,
    limit: number,
  ): Promise<ReviewCard[]> {
    const data = await this.prisma.reviewCard.findMany({
      where: { userId, dueAt: { lte: now } },
      orderBy: { dueAt: "asc" },
      take: limit,
    });
    return data.map((d) => this.mapToDomain(d));
  }

  async findDueByUserAndSource(
    userId: string,
    source: ReviewSource,
    sourceId: string,
    now: Date,
    limit: number,
  ): Promise<ReviewCard[]> {
    const data = await this.prisma.reviewCard.findMany({
      where: { userId, source, sourceId, dueAt: { lte: now } },
      orderBy: { dueAt: "asc" },
      take: limit,
    });
    return data.map((d) => this.mapToDomain(d));
  }

  async countDueByUser(userId: string, now: Date): Promise<number> {
    return this.prisma.reviewCard.count({
      where: { userId, dueAt: { lte: now } },
    });
  }

  async countDueByUserAndSource(
    userId: string,
    source: ReviewSource,
    sourceId: string,
    now: Date,
  ): Promise<number> {
    return this.prisma.reviewCard.count({
      where: { userId, source, sourceId, dueAt: { lte: now } },
    });
  }

  private mapToDomain(data: PrismaReviewCard): ReviewCard {
    return new ReviewCard(
      data.id,
      data.userId,
      data.source as ReviewSource,
      data.sourceId,
      data.questionId,
      data.interval,
      data.easeFactor,
      data.repetitions,
      data.lapses,
      data.dueAt,
      data.createdAt,
      data.updatedAt,
      data.lastReviewedAt ?? undefined,
    );
  }
}
