import {
  resetFake,
  setInvokeResult,
  setInvokeError,
  getInvocations,
} from "./_fakes/langchain.fake";
import { OpenAiTopicConceptGeneratorAdapter } from "../src/openai-topic-concept-generator.adapter";

describe("OpenAiTopicConceptGeneratorAdapter", () => {
  let adapter: OpenAiTopicConceptGeneratorAdapter;

  beforeEach(() => {
    resetFake();
    adapter = new OpenAiTopicConceptGeneratorAdapter({ apiKey: "test-key" });
  });

  describe("generateConceptsFromTopic", () => {
    it("returns mapped concepts and relationships", async () => {
      setInvokeResult({
        concepts: [
          { id: "react-hooks", name: "React Hooks", description: "Hook API" },
          { id: "state-mgmt", name: "State Management", description: null },
        ],
        relationships: [
          { fromId: "react-hooks", toId: "state-mgmt", type: "RELATED_TO" },
        ],
      });

      const result = await adapter.generateConceptsFromTopic("React");

      expect(result.concepts).toHaveLength(2);
      expect(result.concepts[0].description).toBe("Hook API");
      expect(result.concepts[1].description).toBeUndefined();
      expect(result.relationships).toHaveLength(1);
    });

    it.each([
      ["beginner", "10 and 15"],
      ["intermediate", "8 and 12"],
      ["advanced", "8 and 12"],
      ["expert", "6 and 10"],
    ])(
      "adapts guidelines for %s experience level",
      async (level, expectedRange) => {
        setInvokeResult({ concepts: [], relationships: [] });

        await adapter.generateConceptsFromTopic("React", {
          experienceLevel: level as
            | "beginner"
            | "intermediate"
            | "advanced"
            | "expert",
        });

        const messages = getInvocations()[0].messages as Array<{
          role: string;
          content: string;
        }>;
        expect(messages[0].content).toContain(expectedRange);
      },
    );

    it("includes default guidelines when no experience level", async () => {
      setInvokeResult({ concepts: [], relationships: [] });

      await adapter.generateConceptsFromTopic("React");

      const messages = getInvocations()[0].messages as Array<{
        role: string;
        content: string;
      }>;
      expect(messages[0].content).toContain("8 and 15");
    });

    it("includes user context in prompt", async () => {
      setInvokeResult({ concepts: [], relationships: [] });

      await adapter.generateConceptsFromTopic("React", {
        goal: "Build apps",
        experienceLevel: "beginner",
        timeAvailable: 5,
      });

      const messages = getInvocations()[0].messages as Array<{
        role: string;
        content: string;
      }>;
      expect(messages[1].content).toContain("Build apps");
      expect(messages[1].content).toContain("beginner");
    });

    it("includes existing ontology context when provided", async () => {
      setInvokeResult({ concepts: [], relationships: [] });

      await adapter.generateConceptsFromTopic(
        "React",
        undefined,
        "Existing: JavaScript, TypeScript",
      );

      const messages = getInvocations()[0].messages as Array<{
        role: string;
        content: string;
      }>;
      expect(messages[1].content).toContain("Existing: JavaScript, TypeScript");
    });

    it("rethrows errors from the model", async () => {
      setInvokeError(new Error("Token limit"));
      await expect(adapter.generateConceptsFromTopic("React")).rejects.toThrow(
        "Token limit",
      );
    });
  });
});
