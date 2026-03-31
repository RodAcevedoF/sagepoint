import { Quiz } from "../../../../src";

const FIXED_DATE = new Date("2026-01-01T00:00:00.000Z");

describe("Quiz", () => {
  describe("constructor", () => {
    it("creates a quiz with all required fields", () => {
      const quiz = new Quiz(
        "q1",
        "d1",
        "TypeScript Basics",
        10,
        FIXED_DATE,
        FIXED_DATE,
      );

      expect(quiz.id).toBe("q1");
      expect(quiz.documentId).toBe("d1");
      expect(quiz.title).toBe("TypeScript Basics");
      expect(quiz.questionCount).toBe(10);
      expect(quiz.createdAt).toBe(FIXED_DATE);
      expect(quiz.updatedAt).toBe(FIXED_DATE);
      expect(quiz.description).toBeUndefined();
    });

    it("stores optional description when provided", () => {
      const quiz = new Quiz(
        "q2",
        "d2",
        "Advanced TS",
        5,
        FIXED_DATE,
        FIXED_DATE,
        "Deep dive",
      );

      expect(quiz.description).toBe("Deep dive");
    });
  });
});
