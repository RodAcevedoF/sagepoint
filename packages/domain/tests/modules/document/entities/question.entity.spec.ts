import { Question, QuestionType } from "../../../../src";

const FIXED_DATE = new Date("2026-01-01T00:00:00.000Z");

const OPTIONS = [
  { label: "A", text: "Option A", isCorrect: true },
  { label: "B", text: "Option B", isCorrect: false },
];

describe("Question", () => {
  describe("constructor", () => {
    it("creates a multiple-choice question with required fields", () => {
      const q = new Question(
        "q1",
        "quiz-1",
        QuestionType.MULTIPLE_CHOICE,
        "What is TypeScript?",
        OPTIONS,
        1,
        "easy",
        FIXED_DATE,
      );

      expect(q.id).toBe("q1");
      expect(q.quizId).toBe("quiz-1");
      expect(q.type).toBe(QuestionType.MULTIPLE_CHOICE);
      expect(q.text).toBe("What is TypeScript?");
      expect(q.options).toEqual(OPTIONS);
      expect(q.order).toBe(1);
      expect(q.difficulty).toBe("easy");
      expect(q.createdAt).toBe(FIXED_DATE);
      expect(q.explanation).toBeUndefined();
      expect(q.conceptId).toBeUndefined();
    });

    it("creates a true/false question", () => {
      const q = new Question(
        "q2",
        "quiz-1",
        QuestionType.TRUE_FALSE,
        "TS is a superset of JS?",
        OPTIONS,
        2,
        "easy",
        FIXED_DATE,
      );

      expect(q.type).toBe(QuestionType.TRUE_FALSE);
    });

    it("stores optional explanation and conceptId", () => {
      const q = new Question(
        "q3",
        "quiz-1",
        QuestionType.MULTIPLE_CHOICE,
        "Q?",
        OPTIONS,
        1,
        "hard",
        FIXED_DATE,
        "Because X",
        "concept-1",
      );

      expect(q.explanation).toBe("Because X");
      expect(q.conceptId).toBe("concept-1");
    });
  });
});
