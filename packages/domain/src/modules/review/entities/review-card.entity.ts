export enum ReviewSource {
  DOCUMENT = "document",
  ROADMAP_STEP = "roadmap-step",
}

const DEFAULT_EASE_FACTOR = 2.5;
const MIN_EASE_FACTOR = 1.3;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

interface Sm2State {
  interval: number;
  easeFactor: number;
  repetitions: number;
  lapses: number;
}

function applySm2(prev: Sm2State, quality: number): Sm2State {
  if (quality < 3) {
    return {
      interval: 1,
      easeFactor: prev.easeFactor,
      repetitions: 0,
      lapses: prev.lapses + 1,
    };
  }

  const repetitions = prev.repetitions + 1;
  const interval =
    repetitions === 1
      ? 1
      : repetitions === 2
        ? 6
        : Math.round(prev.interval * prev.easeFactor);

  const easeFactor = Math.max(
    MIN_EASE_FACTOR,
    prev.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)),
  );

  return {
    interval,
    easeFactor,
    repetitions,
    lapses: prev.lapses,
  };
}

export class ReviewCard {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly source: ReviewSource,
    public readonly sourceId: string,
    public readonly questionId: string,
    public readonly interval: number,
    public readonly easeFactor: number,
    public readonly repetitions: number,
    public readonly lapses: number,
    public readonly dueAt: Date,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly lastReviewedAt?: Date,
  ) {}

  static schedule(
    id: string,
    userId: string,
    source: ReviewSource,
    sourceId: string,
    questionId: string,
    quality: number,
    now: Date,
  ): ReviewCard {
    const seed = new ReviewCard(
      id,
      userId,
      source,
      sourceId,
      questionId,
      0,
      DEFAULT_EASE_FACTOR,
      0,
      0,
      now,
      now,
      now,
    );
    return seed.review(quality, now);
  }

  review(quality: number, now: Date): ReviewCard {
    const next = applySm2(
      {
        interval: this.interval,
        easeFactor: this.easeFactor,
        repetitions: this.repetitions,
        lapses: this.lapses,
      },
      quality,
    );

    const dueAt = new Date(now.getTime() + next.interval * MS_PER_DAY);

    return new ReviewCard(
      this.id,
      this.userId,
      this.source,
      this.sourceId,
      this.questionId,
      next.interval,
      next.easeFactor,
      next.repetitions,
      next.lapses,
      dueAt,
      this.createdAt,
      now,
      now,
    );
  }
}
