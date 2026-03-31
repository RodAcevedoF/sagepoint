import { QuizAttempt } from "../../../../src";

const FIXED_DATE = new Date("2026-01-01T00:00:00.000Z");

describe("QuizAttempt", () => {
  describe("constructor", () => {
    it("stores all required fields", () => {
      const answers = { q1: "A", q2: "B" };
      const attempt = new QuizAttempt(
        "a1",
        "quiz-1",
        "user-1",
        answers,
        80,
        5,
        4,
        FIXED_DATE,
      );

      expect(attempt.id).toBe("a1");
      expect(attempt.quizId).toBe("quiz-1");
      expect(attempt.userId).toBe("user-1");
      expect(attempt.answers).toEqual(answers);
      expect(attempt.score).toBe(80);
      expect(attempt.totalQuestions).toBe(5);
      expect(attempt.correctAnswers).toBe(4);
      expect(attempt.createdAt).toBe(FIXED_DATE);
      expect(attempt.completedAt).toBeUndefined();
    });

    it("stores optional completedAt when provided", () => {
      const completedAt = new Date("2026-01-02T00:00:00.000Z");
      const attempt = new QuizAttempt(
        "a2",
        "quiz-1",
        "user-1",
        {},
        100,
        3,
        3,
        FIXED_DATE,
        completedAt,
      );

      expect(attempt.completedAt).toBe(completedAt);
    });
  });
});
