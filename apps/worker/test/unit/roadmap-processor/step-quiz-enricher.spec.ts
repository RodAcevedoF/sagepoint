import { enrichStepQuizzes } from "../../../src/roadmap-processor/step-quiz-enricher";
import { FakeStepQuizGenerationService } from "../_fakes/services.fake";
import type { RoadmapStep, DiscoveredResource } from "@sagepoint/domain";
import { Concept } from "@sagepoint/domain";
import { ResourceType } from "@sagepoint/domain";

function makeConcept(id: string, name: string): Concept {
  return new Concept(id, name, undefined, `Description of ${name}`);
}

function makeStep(
  conceptId: string,
  name: string,
  order: number,
  overrides: Partial<RoadmapStep> = {},
): RoadmapStep {
  return {
    concept: makeConcept(conceptId, name),
    order,
    dependsOn: [],
    learningObjective: `Learn ${name}`,
    rationale: `Why ${name} matters`,
    difficulty: "intermediate",
    ...overrides,
  };
}

function makeResource(title: string, description?: string): DiscoveredResource {
  return {
    title,
    url: `https://example.com/${title}`,
    type: ResourceType.ARTICLE,
    description,
  };
}

const ROADMAP_ID = "roadmap-001";

describe("enrichStepQuizzes", () => {
  it("returns empty array and skips service call for empty steps", async () => {
    const service = new FakeStepQuizGenerationService();
    const result = await enrichStepQuizzes(
      { roadmapId: ROADMAP_ID, steps: [], resourceMap: new Map() },
      { service },
    );
    expect(result).toHaveLength(0);
    expect(service.lastInput).toHaveLength(0);
  });

  it("includes resource snippets from top-2 resources in service input", async () => {
    const service = new FakeStepQuizGenerationService();
    const steps = [makeStep("c1", "Linear Algebra", 0)];
    const resourceMap = new Map([
      [
        "c1",
        [
          makeResource("Intro to LA", "Linear algebra foundations"),
          makeResource("Advanced LA", "Advanced topics"),
          makeResource("Extra resource", "This should not appear"),
        ],
      ],
    ]);

    await enrichStepQuizzes(
      { roadmapId: ROADMAP_ID, steps, resourceMap },
      { service },
    );

    const input = service.lastInput[0];
    expect(input.resourceSnippets).toHaveLength(2);
    expect(input.resourceSnippets).toContain("Linear algebra foundations");
    expect(input.resourceSnippets).toContain("Advanced topics");
    expect(input.resourceSnippets).not.toContain("This should not appear");
  });

  it("falls back to resource title when description is absent", async () => {
    const service = new FakeStepQuizGenerationService();
    const steps = [makeStep("c1", "Algebra", 0)];
    const resourceMap = new Map([["c1", [makeResource("Algebra Basics")]]]);

    await enrichStepQuizzes(
      { roadmapId: ROADMAP_ID, steps, resourceMap },
      { service },
    );

    expect(service.lastInput[0].resourceSnippets).toEqual(["Algebra Basics"]);
  });

  it("produces empty resourceSnippets when concept has no resources", async () => {
    const service = new FakeStepQuizGenerationService();
    const steps = [makeStep("c1", "Unknown Concept", 0)];

    await enrichStepQuizzes(
      { roadmapId: ROADMAP_ID, steps, resourceMap: new Map() },
      { service },
    );

    expect(service.lastInput[0].resourceSnippets).toHaveLength(0);
  });

  it("maps step.order to stepOrder (not array index)", async () => {
    const service = new FakeStepQuizGenerationService();
    const steps = [makeStep("c1", "Linear Algebra", 5)];

    const result = await enrichStepQuizzes(
      { roadmapId: ROADMAP_ID, steps, resourceMap: new Map() },
      { service },
    );

    expect(result.length).toBeGreaterThan(0);
    expect(result.every((q) => q.stepOrder === 5)).toBe(true);
  });

  it("stamps every question with roadmapId", async () => {
    const service = new FakeStepQuizGenerationService();
    const steps = [makeStep("c1", "Concept A", 0)];

    const result = await enrichStepQuizzes(
      { roadmapId: ROADMAP_ID, steps, resourceMap: new Map() },
      { service },
    );

    expect(result.every((q) => q.roadmapId === ROADMAP_ID)).toBe(true);
  });

  it("propagates service errors (graceful handling is caller's responsibility)", async () => {
    const service = new FakeStepQuizGenerationService();
    service.setShouldFail(true);

    await expect(
      enrichStepQuizzes(
        {
          roadmapId: ROADMAP_ID,
          steps: [makeStep("c1", "X", 0)],
          resourceMap: new Map(),
        },
        { service },
      ),
    ).rejects.toThrow("Step quiz generation failed");
  });
});
