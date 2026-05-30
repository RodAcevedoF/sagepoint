import { Logger } from '@nestjs/common';
import {
  ReviewSource,
  type IReviewCardRepository,
  type IQuestionRepository,
  type IRoadmapStepQuestionRepository,
  type Question,
  type QuestionOption,
  type ReviewCard,
  type RoadmapStepQuestion,
} from '@sagepoint/domain';

export interface GetReviewQueueQuery {
  userId: string;
  source?: ReviewSource;
  sourceId?: string;
  limit?: number;
  now?: Date;
}

export interface ReviewQueueOption {
  label: string;
  text: string;
}

export interface ReviewQueueQuestion {
  id: string;
  text: string;
  type: string;
  options: ReviewQueueOption[];
  difficulty: string;
}

export interface ReviewQueueItem {
  cardId: string;
  source: ReviewSource;
  sourceId: string;
  dueAt: string;
  interval: number;
  easeFactor: number;
  repetitions: number;
  lapses: number;
  lastReviewedAt: string | null;
  question: ReviewQueueQuestion;
}

const DEFAULT_LIMIT = 50;

export class GetReviewQueueUseCase {
  private readonly logger = new Logger(GetReviewQueueUseCase.name);

  constructor(
    private readonly cardRepository: IReviewCardRepository,
    private readonly questionRepository: IQuestionRepository,
    private readonly stepQuestionRepository: IRoadmapStepQuestionRepository,
  ) {}

  async execute(query: GetReviewQueueQuery): Promise<ReviewQueueItem[]> {
    const now = query.now ?? new Date();
    const limit = query.limit ?? DEFAULT_LIMIT;

    const cards =
      query.source && query.sourceId
        ? await this.cardRepository.findDueByUserAndSource(
            query.userId,
            query.source,
            query.sourceId,
            now,
            limit,
          )
        : await this.cardRepository.findDueByUser(query.userId, now, limit);

    if (cards.length === 0) return [];

    const docIds: string[] = [];
    const stepIds: string[] = [];
    for (const card of cards) {
      if (card.source === ReviewSource.DOCUMENT) docIds.push(card.questionId);
      else stepIds.push(card.questionId);
    }

    const [docs, steps] = await Promise.all([
      this.questionRepository.findManyByIds(docIds),
      this.stepQuestionRepository.findManyByIds(stepIds),
    ]);

    const docMap = new Map(docs.map((q) => [q.id, q]));
    const stepMap = new Map(steps.map((q) => [q.id, q]));

    const items: ReviewQueueItem[] = [];
    for (const card of cards) {
      const item =
        card.source === ReviewSource.DOCUMENT
          ? this.toItemFromDocument(card, docMap.get(card.questionId))
          : this.toItemFromStep(card, stepMap.get(card.questionId));
      if (item) items.push(item);
    }
    return items;
  }

  private toItemFromDocument(
    card: ReviewCard,
    question: Question | undefined,
  ): ReviewQueueItem | null {
    if (!question) {
      this.logger.warn(
        `Review card ${card.id} references missing document question ${card.questionId}`,
      );
      return null;
    }
    return toQueueItem(card, {
      id: question.id,
      text: question.text,
      type: question.type,
      options: question.options,
      difficulty: question.difficulty,
    });
  }

  private toItemFromStep(
    card: ReviewCard,
    question: RoadmapStepQuestion | undefined,
  ): ReviewQueueItem | null {
    if (!question) {
      this.logger.warn(
        `Review card ${card.id} references missing roadmap-step question ${card.questionId}`,
      );
      return null;
    }
    return toQueueItem(card, {
      id: question.id,
      text: question.text,
      type: question.type,
      options: question.options,
      difficulty: question.difficulty,
    });
  }
}

function toQueueItem(
  card: ReviewCard,
  question: {
    id: string;
    text: string;
    type: string;
    options: QuestionOption[];
    difficulty: string;
  },
): ReviewQueueItem {
  return {
    cardId: card.id,
    source: card.source,
    sourceId: card.sourceId,
    dueAt: card.dueAt.toISOString(),
    interval: card.interval,
    easeFactor: card.easeFactor,
    repetitions: card.repetitions,
    lapses: card.lapses,
    lastReviewedAt: card.lastReviewedAt
      ? card.lastReviewedAt.toISOString()
      : null,
    question: {
      id: question.id,
      text: question.text,
      type: question.type,
      options: question.options.map((o) => ({ label: o.label, text: o.text })),
      difficulty: question.difficulty,
    },
  };
}
