import {
  resetFake,
  setInvokeResult,
  setInvokeError,
  getInvocations,
} from "./_fakes/langchain.fake";
import { PerplexityResearchAdapter } from "../src/perplexity-research.adapter";
import { ResourceType } from "@sagepoint/domain";

describe("PerplexityResearchAdapter", () => {
  let adapter: PerplexityResearchAdapter;

  beforeEach(() => {
    resetFake();
    adapter = new PerplexityResearchAdapter({ apiKey: "test-key" });
  });

  describe("discoverResourcesForConcept", () => {
    it("returns mapped resources with null→undefined conversion", async () => {
      setInvokeResult({
        resources: [
          {
            title: "React Docs",
            url: "https://react.dev",
            type: "DOCUMENTATION",
            description: "Official docs",
            provider: "Meta",
            estimatedDuration: 60,
            difficulty: "beginner",
          },
          {
            title: "Advanced Hooks",
            url: "https://example.com/hooks",
            type: "ARTICLE",
            description: null,
            provider: null,
            estimatedDuration: null,
            difficulty: null,
          },
        ],
      });

      const result = await adapter.discoverResourcesForConcept("React Hooks");

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        title: "React Docs",
        url: "https://react.dev",
        type: "DOCUMENTATION",
        description: "Official docs",
        provider: "Meta",
        estimatedDuration: 60,
        difficulty: "beginner",
      });
      expect(result[1].description).toBeUndefined();
      expect(result[1].provider).toBeUndefined();
      expect(result[1].estimatedDuration).toBeUndefined();
      expect(result[1].difficulty).toBeUndefined();
    });

    it("uses default maxResults=5 in prompt", async () => {
      setInvokeResult({ resources: [] });

      await adapter.discoverResourcesForConcept("React");

      const messages = getInvocations()[0].messages as Array<{
        role: string;
        content: string;
      }>;
      expect(messages[1].content).toContain("Find 5");
    });

    it("respects custom maxResults option", async () => {
      setInvokeResult({ resources: [] });

      await adapter.discoverResourcesForConcept("React", undefined, {
        maxResults: 10,
      });

      const messages = getInvocations()[0].messages as Array<{
        role: string;
        content: string;
      }>;
      expect(messages[1].content).toContain("Find 10");
    });

    it("includes difficulty filter in system prompt", async () => {
      setInvokeResult({ resources: [] });

      await adapter.discoverResourcesForConcept("React", undefined, {
        difficulty: "advanced",
      });

      const messages = getInvocations()[0].messages as Array<{
        role: string;
        content: string;
      }>;
      expect(messages[0].content).toContain("advanced-level resources");
    });

    it("includes preferred types filter in system prompt", async () => {
      setInvokeResult({ resources: [] });

      await adapter.discoverResourcesForConcept("React", undefined, {
        preferredTypes: [ResourceType.VIDEO, ResourceType.TUTORIAL],
      });

      const messages = getInvocations()[0].messages as Array<{
        role: string;
        content: string;
      }>;
      expect(messages[0].content).toContain("VIDEO, TUTORIAL");
    });

    it("includes free-only filter in system prompt", async () => {
      setInvokeResult({ resources: [] });

      await adapter.discoverResourcesForConcept("React", undefined, {
        freeOnly: true,
      });

      const messages = getInvocations()[0].messages as Array<{
        role: string;
        content: string;
      }>;
      expect(messages[0].content).toContain("free resources");
    });

    it("includes concept description in user prompt", async () => {
      setInvokeResult({ resources: [] });

      await adapter.discoverResourcesForConcept(
        "React Hooks",
        "Functions for state management",
      );

      const messages = getInvocations()[0].messages as Array<{
        role: string;
        content: string;
      }>;
      expect(messages[1].content).toContain("Functions for state management");
    });

    it("returns empty array on error (does not throw)", async () => {
      setInvokeError(new Error("Perplexity down"));

      const result = await adapter.discoverResourcesForConcept("React");

      expect(result).toEqual([]);
    });
  });
});
