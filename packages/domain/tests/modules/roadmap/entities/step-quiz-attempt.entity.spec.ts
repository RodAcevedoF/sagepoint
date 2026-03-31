import { StepQuizAttempt } from "../../../../src";
import { QuestionType } from "../../../../src";

const FIXED_DATE = new Date("2026-01-01T00:00:00.000Z");

const QUESTION = {
  text: "What is a generic?",
  type: QuestionType.MULTIPLE_CHOICE,
  options: [
    { label: "A", text: "A type parameter", isCorrect: true },
    { label: "B", text: "A class", isCorrect: false },
  ],
  difficulty: "medium",
};

const BASE_PROPS = {
  id: "sqa-1",
  userId: "user-1",
  roadmapId: "roadmap-1",
  conceptId: "concept-1",
  questions: [QUESTION],
  score: 100,
  totalQuestions: 1,
  correctAnswers: 1,
  passed: true,
  createdAt: FIXED_DATE,
};

describe("StepQuizAttempt", () => {
  describe("constructor", () => {
    it("stores all required fields", () => {
      const attempt = new StepQuizAttempt(BASE_PROPS);

      expect(attempt.id).toBe("sqa-1");
      expect(attempt.userId).toBe("user-1");
      expect(attempt.roadmapId).toBe("roadmap-1");
      expect(attempt.conceptId).toBe("concept-1");
      expect(attempt.questions).toEqual([QUESTION]);
      expect(attempt.score).toBe(100);
      expect(attempt.totalQuestions).toBe(1);
      expect(attempt.correctAnswers).toBe(1);
      expect(attempt.passed).toBe(true);
      expect(attempt.createdAt).toBe(FIXED_DATE);
      expect(attempt.completedAt).toBeUndefined();
    });

    it("defaults answers to null when not provided", () => {
      const attempt = new StepQuizAttempt(BASE_PROPS);

      expect(attempt.answers).toBeNull();
    });

    it("defaults answers to null when explicitly set to null", () => {
      const attempt = new StepQuizAttempt({ ...BASE_PROPS, answers: null });

      expect(attempt.answers).toBeNull();
    });

    it("stores answers when provided", () => {
      const answers = { 0: "A" };
      const attempt = new StepQuizAttempt({ ...BASE_PROPS, answers });

      expect(attempt.answers).toEqual(answers);
    });

    it("stores optional completedAt when provided", () => {
      const completedAt = new Date("2026-01-02T00:00:00.000Z");
      const attempt = new StepQuizAttempt({ ...BASE_PROPS, completedAt });

      expect(attempt.completedAt).toBe(completedAt);
    });
  });
});
