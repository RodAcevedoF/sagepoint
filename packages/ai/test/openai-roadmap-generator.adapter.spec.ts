import {
  resetFake,
  setInvokeResult,
  setInvokeError,
  getInvocations,
} from "./_fakes/langchain.fake";
import { OpenAiRoadmapGeneratorAdapter } from "../src/openai-roadmap-generator.adapter";
import type {
  ConceptForOrdering,
  ConceptRelationshipForOrdering,
} from "@sagepoint/domain";

describe("OpenAiRoadmapGeneratorAdapter", () => {
  let adapter: OpenAiRoadmapGeneratorAdapter;

  beforeEach(() => {
    resetFake();
    adapter = new OpenAiRoadmapGeneratorAdapter({ apiKey: "test-key" });
  });

  describe("generateLearningPath", () => {
    const concepts: ConceptForOrdering[] = [
      { id: "c1", name: "Variables", description: "Basics of variables" },
      { id: "c2", name: "Functions", description: "Function declarations" },
    ];

    const relationships: ConceptRelationshipForOrdering[] = [
      { fromId: "c1", toId: "c2", type: "DEPENDS_ON" },
    ];

    it("returns empty path when no concepts provided", async () => {
      const result = await adapter.generateLearningPath([], []);

      expect(result.orderedConcepts).toEqual([]);
      expect(result.description).toContain("No concepts");
      expect(getInvocations()).toHaveLength(0);
    });

    it("maps structured output to GeneratedLearningPath", async () => {
      setInvokeResult({
        orderedConcepts: [
          {
            conceptId: "c1",
            order: 1,
            learningObjective: "Understand variables",
            estimatedDuration: 30,
            difficulty: "beginner",
            rationale: "Foundation concept",
          },
          {
            conceptId: "c2",
            order: 2,
            learningObjective: "Write functions",
            estimatedDuration: null,
            difficulty: "intermediate",
            rationale: "Requires variables",
          },
        ],
        description: "A progressive JS path",
        totalEstimatedDuration: 60,
        recommendedPace: "2 concepts/week",
      });

      const result = await adapter.generateLearningPath(
        concepts,
        relationships,
      );

      expect(result.orderedConcepts).toHaveLength(2);
      expect(result.orderedConcepts[0].estimatedDuration).toBe(30);
      expect(result.orderedConcepts[1].estimatedDuration).toBeUndefined();
      expect(result.description).toBe("A progressive JS path");
      expect(result.totalEstimatedDuration).toBe(60);
      expect(result.recommendedPace).toBe("2 concepts/week");
    });

    it("converts null nullable fields to undefined", async () => {
      setInvokeResult({
        orderedConcepts: [],
        description: "Path",
        totalEstimatedDuration: null,
        recommendedPace: null,
      });

      const result = await adapter.generateLearningPath(
        concepts,
        relationships,
      );

      expect(result.totalEstimatedDuration).toBeUndefined();
      expect(result.recommendedPace).toBeUndefined();
    });

    it("includes concepts and relationships in the prompt", async () => {
      setInvokeResult({
        orderedConcepts: [],
        description: "",
        totalEstimatedDuration: null,
        recommendedPace: null,
      });

      await adapter.generateLearningPath(concepts, relationships);

      const messages = getInvocations()[0].messages as Array<{
        role: string;
        content: string;
      }>;
      expect(messages[1].content).toContain("Variables");
      expect(messages[1].content).toContain("Functions");
      expect(messages[1].content).toContain("DEPENDS_ON");
    });

    it("includes user context when provided", async () => {
      setInvokeResult({
        orderedConcepts: [],
        description: "",
        totalEstimatedDuration: null,
        recommendedPace: null,
      });

      await adapter.generateLearningPath(concepts, relationships, {
        goal: "Learn JS",
        experienceLevel: "beginner",
        timeAvailable: 10,
        preferredLearningStyle: "visual",
      });

      const messages = getInvocations()[0].messages as Array<{
        role: string;
        content: string;
      }>;
      expect(messages[1].content).toContain("Learn JS");
      expect(messages[1].content).toContain("beginner");
      expect(messages[1].content).toContain("10 hours/week");
      expect(messages[1].content).toContain("visual");
    });

    it("rethrows errors from the model", async () => {
      setInvokeError(new Error("LLM failed"));
      await expect(
        adapter.generateLearningPath(concepts, relationships),
      ).rejects.toThrow("LLM failed");
    });
  });
});
