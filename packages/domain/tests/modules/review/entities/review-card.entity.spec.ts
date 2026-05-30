import { ReviewCard, ReviewSource } from "../../../../src";

const FIXED_NOW = new Date("2026-01-01T00:00:00.000Z");
const DAY_MS = 24 * 60 * 60 * 1000;

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_MS);
}

function makeFresh(): ReviewCard {
  return new ReviewCard(
    "card-1",
    "user-1",
    ReviewSource.DOCUMENT,
    "quiz-1",
    "q-1",
    0,
    2.5,
    0,
    0,
    FIXED_NOW,
    FIXED_NOW,
    FIXED_NOW,
  );
}

describe("ReviewCard", () => {
  describe("schedule (first review)", () => {
    it("creates a card with interval=1 day after a correct answer (quality 4)", () => {
      const card = ReviewCard.schedule(
        "card-1",
        "user-1",
        ReviewSource.DOCUMENT,
        "quiz-1",
        "q-1",
        4,
        FIXED_NOW,
      );

      expect(card.repetitions).toBe(1);
      expect(card.interval).toBe(1);
      expect(card.lapses).toBe(0);
      expect(card.dueAt).toEqual(addDays(FIXED_NOW, 1));
      expect(card.lastReviewedAt).toEqual(FIXED_NOW);
    });

    it("creates a card with interval=1 day and a lapse after an incorrect answer (quality 1)", () => {
      const card = ReviewCard.schedule(
        "card-1",
        "user-1",
        ReviewSource.DOCUMENT,
        "quiz-1",
        "q-1",
        1,
        FIXED_NOW,
      );

      expect(card.repetitions).toBe(0);
      expect(card.interval).toBe(1);
      expect(card.lapses).toBe(1);
      expect(card.dueAt).toEqual(addDays(FIXED_NOW, 1));
    });
  });

  describe("review — SM-2 interval progression on consecutive correct answers", () => {
    it("follows the 1 → 6 → round(prev * ease) sequence", () => {
      const r1 = makeFresh().review(4, FIXED_NOW);
      expect(r1.repetitions).toBe(1);
      expect(r1.interval).toBe(1);

      const r2 = r1.review(4, addDays(FIXED_NOW, 1));
      expect(r2.repetitions).toBe(2);
      expect(r2.interval).toBe(6);

      const r3 = r2.review(4, addDays(FIXED_NOW, 7));
      expect(r3.repetitions).toBe(3);
      expect(r3.interval).toBe(Math.round(6 * r2.easeFactor));
    });
  });

  describe("review — easeFactor changes by quality", () => {
    it("stays flat at quality 4 (neutral)", () => {
      const reviewed = makeFresh().review(4, FIXED_NOW);
      expect(reviewed.easeFactor).toBeCloseTo(2.5, 5);
    });

    it("increases at quality 5", () => {
      const reviewed = makeFresh().review(5, FIXED_NOW);
      expect(reviewed.easeFactor).toBeGreaterThan(2.5);
    });

    it("decreases at quality 3", () => {
      const reviewed = makeFresh().review(3, FIXED_NOW);
      expect(reviewed.easeFactor).toBeLessThan(2.5);
    });

    it("never drops below 1.3 floor after many low-quality reviews", () => {
      let card = makeFresh();
      for (let i = 0; i < 20; i++) {
        card = card.review(3, addDays(FIXED_NOW, i));
      }
      expect(card.easeFactor).toBeGreaterThanOrEqual(1.3);
    });
  });

  describe("review — lapse on quality < 3", () => {
    it("resets repetitions, sets interval=1, increments lapses, keeps ease", () => {
      const reviewed = makeFresh()
        .review(4, FIXED_NOW)
        .review(4, addDays(FIXED_NOW, 1));
      const easeBeforeLapse = reviewed.easeFactor;

      const lapsed = reviewed.review(1, addDays(FIXED_NOW, 7));

      expect(lapsed.repetitions).toBe(0);
      expect(lapsed.interval).toBe(1);
      expect(lapsed.lapses).toBe(1);
      expect(lapsed.easeFactor).toBe(easeBeforeLapse);
      expect(lapsed.dueAt).toEqual(addDays(FIXED_NOW, 8));
    });
  });

  describe("review — immutability", () => {
    it("returns a new instance and never mutates the original", () => {
      const original = makeFresh();
      const reviewed = original.review(4, FIXED_NOW);

      expect(reviewed).not.toBe(original);
      expect(original.repetitions).toBe(0);
      expect(original.interval).toBe(0);
      expect(reviewed.id).toBe(original.id);
      expect(reviewed.questionId).toBe(original.questionId);
      expect(reviewed.source).toBe(original.source);
      expect(reviewed.createdAt).toBe(original.createdAt);
    });
  });
});
