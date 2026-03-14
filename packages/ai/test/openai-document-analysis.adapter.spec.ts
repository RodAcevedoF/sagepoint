import {
  resetFake,
  setInvokeResult,
  setInvokeError,
  getInvocations,
} from "./_fakes/langchain.fake";
import { OpenAiDocumentAnalysisAdapter } from "../src/openai-document-analysis.adapter";

describe("OpenAiDocumentAnalysisAdapter", () => {
  let adapter: OpenAiDocumentAnalysisAdapter;

  beforeEach(() => {
    resetFake();
    adapter = new OpenAiDocumentAnalysisAdapter({ apiKey: "test-key" });
  });

  describe("analyzeDocument", () => {
    it("returns the structured analysis result", async () => {
      const expected = {
        overview: "This document covers React fundamentals.",
        keyPoints: ["Component model", "State management", "Hooks API"],
        topicArea: "Web Development",
        difficulty: "intermediate" as const,
      };
      setInvokeResult(expected);

      const result = await adapter.analyzeDocument("React document text...");

      expect(result).toEqual(expected);
    });

    it("passes system and user messages", async () => {
      setInvokeResult({
        overview: "",
        keyPoints: [],
        topicArea: "",
        difficulty: "beginner",
      });

      await adapter.analyzeDocument("Sample text");

      const invocations = getInvocations();
      const messages = invocations[0].messages as Array<{
        role: string;
        content: string;
      }>;
      expect(messages[0].role).toBe("system");
      expect(messages[0].content).toContain("educational content analyst");
      expect(messages[1].role).toBe("user");
      expect(messages[1].content).toBe("Sample text");
    });

    it("rethrows errors from the model", async () => {
      setInvokeError(new Error("API down"));
      await expect(adapter.analyzeDocument("text")).rejects.toThrow("API down");
    });
  });
});
