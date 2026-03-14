import {
  resetFake,
  setInvokeResult,
  setInvokeError,
  getInvocations,
} from "./_fakes/langchain.fake";
import { OpenAiConceptExpansionAdapter } from "../src/openai-concept-expansion.adapter";

describe("OpenAiConceptExpansionAdapter", () => {
  let adapter: OpenAiConceptExpansionAdapter;

  beforeEach(() => {
    resetFake();
    adapter = new OpenAiConceptExpansionAdapter({ apiKey: "test-key" });
  });

  describe("generateSubConcepts", () => {
    it("returns mapped sub-concepts with null→undefined conversion", async () => {
      setInvokeResult({
        subConcepts: [
          {
            name: "useState",
            description: "State hook",
            order: 1,
            estimatedDuration: 20,
            difficulty: "beginner",
            learningObjective: "Use useState",
          },
          {
            name: "useEffect",
            description: "Effect hook",
            order: 2,
            estimatedDuration: null,
            difficulty: "intermediate",
            learningObjective: "Handle side effects",
          },
        ],
      });

      const result = await adapter.generateSubConcepts("React Hooks");

      expect(result).toHaveLength(2);
      expect(result[0].estimatedDuration).toBe(20);
      expect(result[1].estimatedDuration).toBeUndefined();
      expect(result[0].name).toBe("useState");
    });

    it("includes parent description in prompt when provided", async () => {
      setInvokeResult({ subConcepts: [] });

      await adapter.generateSubConcepts("Hooks", "React hook system");

      const messages = getInvocations()[0].messages as Array<{
        role: string;
        content: string;
      }>;
      expect(messages[1].content).toContain("React hook system");
    });

    it("includes sibling concepts in prompt", async () => {
      setInvokeResult({ subConcepts: [] });

      await adapter.generateSubConcepts("Hooks", undefined, [
        "Components",
        "JSX",
      ]);

      const messages = getInvocations()[0].messages as Array<{
        role: string;
        content: string;
      }>;
      expect(messages[1].content).toContain("Components, JSX");
    });

    it("includes user context in prompt", async () => {
      setInvokeResult({ subConcepts: [] });

      await adapter.generateSubConcepts("Hooks", undefined, undefined, {
        experienceLevel: "advanced",
        goal: "Master React",
      });

      const messages = getInvocations()[0].messages as Array<{
        role: string;
        content: string;
      }>;
      expect(messages[1].content).toContain("advanced");
      expect(messages[1].content).toContain("Master React");
    });

    it("rethrows errors from the model", async () => {
      setInvokeError(new Error("Service unavailable"));
      await expect(adapter.generateSubConcepts("X")).rejects.toThrow(
        "Service unavailable",
      );
    });
  });
});
