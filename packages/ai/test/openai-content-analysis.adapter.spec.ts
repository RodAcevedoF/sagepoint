import {
  resetFake,
  setInvokeResult,
  setInvokeError,
  getInvocations,
  mockWithStructuredOutput,
} from "./_fakes/langchain.fake";
import { OpenAiContentAnalysisAdapter } from "../src/openai-content-analysis.adapter";

describe("OpenAiContentAnalysisAdapter", () => {
  let adapter: OpenAiContentAnalysisAdapter;

  beforeEach(() => {
    resetFake();
    adapter = new OpenAiContentAnalysisAdapter({ apiKey: "test-key" });
  });

  describe("extractConcepts", () => {
    it("returns mapped concepts from structured output", async () => {
      setInvokeResult({
        concepts: [
          {
            name: "React Hooks",
            description: "Functions for state in functional components",
            relationships: [
              { targetName: "State Management", type: "RELATED_TO" },
            ],
          },
          {
            name: "State Management",
            description: "Managing application state",
            relationships: [],
          },
        ],
      });

      const result = await adapter.extractConcepts("Some document about React");

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        name: "React Hooks",
        description: "Functions for state in functional components",
        relationships: [{ targetName: "State Management", type: "RELATED_TO" }],
      });
      expect(result[1].relationships).toEqual([]);
    });

    it("returns empty array for empty text", async () => {
      const result = await adapter.extractConcepts("");
      expect(result).toEqual([]);
      expect(getInvocations()).toHaveLength(0);
    });

    it("returns empty array for whitespace-only text", async () => {
      const result = await adapter.extractConcepts("   \n  ");
      expect(result).toEqual([]);
    });

    it("passes system and user messages to the model", async () => {
      setInvokeResult({ concepts: [] });

      await adapter.extractConcepts("Test text");

      const invocations = getInvocations();
      expect(invocations).toHaveLength(1);

      const messages = invocations[0].messages as Array<{
        role: string;
        content: string;
      }>;
      expect(messages[0].role).toBe("system");
      expect(messages[0].content).toContain("educational content analyzer");
      expect(messages[1].role).toBe("user");
      expect(messages[1].content).toBe("Test text");
    });

    it("calls withStructuredOutput with a Zod schema", async () => {
      setInvokeResult({ concepts: [] });

      await adapter.extractConcepts("Test");

      expect(mockWithStructuredOutput).toHaveBeenCalled();
    });

    it("defaults undefined relationships to empty array", async () => {
      setInvokeResult({
        concepts: [
          { name: "A", description: "Desc", relationships: undefined },
        ],
      });

      const result = await adapter.extractConcepts("Text");
      expect(result[0].relationships).toEqual([]);
    });

    it("rethrows errors from the model", async () => {
      setInvokeError(new Error("Rate limit exceeded"));

      await expect(adapter.extractConcepts("Text")).rejects.toThrow(
        "Rate limit exceeded",
      );
    });
  });
});
