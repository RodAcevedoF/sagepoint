import {
  resetFake,
  setInvokeResult,
  setInvokeError,
  getInvocations,
} from "./_fakes/langchain.fake";
import { OpenAiQuizGenerationAdapter } from "../src/openai-quiz-generation.adapter";

describe("OpenAiQuizGenerationAdapter", () => {
  let adapter: OpenAiQuizGenerationAdapter;

  beforeEach(() => {
    resetFake();
    adapter = new OpenAiQuizGenerationAdapter({ apiKey: "test-key" });
  });

  describe("generateQuiz", () => {
    const mockQuestions = {
      questions: [
        {
          type: "MULTIPLE_CHOICE",
          text: "What is a React Hook?",
          options: [
            { label: "A", text: "A function", isCorrect: true },
            { label: "B", text: "A class", isCorrect: false },
            { label: "C", text: "A module", isCorrect: false },
            { label: "D", text: "A file", isCorrect: false },
          ],
          explanation: "Hooks are functions.",
          conceptName: "React Hooks",
          difficulty: "intermediate",
        },
        {
          type: "TRUE_FALSE",
          text: "useState returns an array.",
          options: [
            { label: "True", text: "True", isCorrect: true },
            { label: "False", text: "False", isCorrect: false },
          ],
          explanation: "useState returns [value, setter].",
          conceptName: null,
          difficulty: "beginner",
        },
      ],
    };

    it("returns mapped questions with correct types", async () => {
      setInvokeResult(mockQuestions);

      const result = await adapter.generateQuiz("text", ["React Hooks"]);

      expect(result).toHaveLength(2);
      expect(result[0].type).toBe("MULTIPLE_CHOICE");
      expect(result[0].text).toBe("What is a React Hook?");
      expect(result[0].options).toHaveLength(4);
      expect(result[1].type).toBe("TRUE_FALSE");
    });

    it("strips conceptName from output (not in GeneratedQuestion)", async () => {
      setInvokeResult(mockQuestions);

      const result = await adapter.generateQuiz("text", []);

      expect(result[0]).not.toHaveProperty("conceptName");
    });

    it("uses default questionCount=10 and difficulty=intermediate", async () => {
      setInvokeResult({ questions: [] });

      await adapter.generateQuiz("text", ["A"]);

      const messages = getInvocations()[0].messages as Array<{
        role: string;
        content: string;
      }>;
      expect(messages[0].content).toContain("exactly 10 questions");
      expect(messages[0].content).toContain("difficulty level: intermediate");
    });

    it("respects custom options", async () => {
      setInvokeResult({ questions: [] });

      await adapter.generateQuiz("text", ["A"], {
        questionCount: 5,
        difficulty: "advanced",
      });

      const messages = getInvocations()[0].messages as Array<{
        role: string;
        content: string;
      }>;
      expect(messages[0].content).toContain("exactly 5 questions");
      expect(messages[0].content).toContain("difficulty level: advanced");
    });

    it("includes concept names in user prompt when provided", async () => {
      setInvokeResult({ questions: [] });

      await adapter.generateQuiz("doc text", ["Hooks", "State"]);

      const messages = getInvocations()[0].messages as Array<{
        role: string;
        content: string;
      }>;
      expect(messages[1].content).toContain("Hooks, State");
    });

    it("rethrows errors from the model", async () => {
      setInvokeError(new Error("Timeout"));
      await expect(adapter.generateQuiz("t", [])).rejects.toThrow("Timeout");
    });
  });
});
