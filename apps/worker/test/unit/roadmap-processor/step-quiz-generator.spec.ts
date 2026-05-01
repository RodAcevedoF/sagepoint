import { generateStepQuizzes } from "../../../src/roadmap-processor/step-quiz-generator";
import { FakeStepQuizGenerationService } from "../_fakes/services.fake";
import type { RoadmapStep } from "@sagepoint/domain";
import { Concept } from "@sagepoint/domain";

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

const ROADMAP_ID = "roadmap-001";

describe("generateStepQuizzes", () => {
  it("returns empty array and skips service call for empty steps", async () => {
    const service = new FakeStepQuizGenerationService();
    const result = await generateStepQuizzes(
      { roadmapId: ROADMAP_ID, steps: [] },
      { service },
    );
    expect(result).toHaveLength(0);
    expect(service.lastInput).toHaveLength(0);
  });

  it("maps step.order to stepOrder (not array index)", async () => {
    const service = new FakeStepQuizGenerationService();
    const steps = [makeStep("c1", "Linear Algebra", 5)];

    const result = await generateStepQuizzes(
      { roadmapId: ROADMAP_ID, steps },
      { service },
    );

    expect(result.length).toBeGreaterThan(0);
    expect(result.every((q) => q.stepOrder === 5)).toBe(true);
    expect(result.every((q) => q.stepOrder !== 0)).toBe(true);
  });

  it("assigns correct conceptId from generated result", async () => {
    const service = new FakeStepQuizGenerationService();
    const steps = [
      makeStep("c1", "Concept A", 0),
      makeStep("c2", "Concept B", 1),
    ];

    const result = await generateStepQuizzes(
      { roadmapId: ROADMAP_ID, steps },
      { service },
    );

    const conceptIds = result.map((q) => q.conceptId);
    expect(conceptIds).toContain("c1");
    expect(conceptIds).toContain("c2");
  });

  it("stamps every question with the roadmapId", async () => {
    const service = new FakeStepQuizGenerationService();
    const steps = [makeStep("c1", "Concept A", 0)];

    const result = await generateStepQuizzes(
      { roadmapId: ROADMAP_ID, steps },
      { service },
    );

    expect(result.every((q) => q.roadmapId === ROADMAP_ID)).toBe(true);
  });

  it("assigns unique UUIDs to each question row", async () => {
    const service = new FakeStepQuizGenerationService();
    const steps = [
      makeStep("c1", "Concept A", 0),
      makeStep("c2", "Concept B", 1),
    ];

    const result = await generateStepQuizzes(
      { roadmapId: ROADMAP_ID, steps },
      { service },
    );

    const ids = result.map((q) => q.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("propagates service errors (graceful handling is caller's responsibility)", async () => {
    const service = new FakeStepQuizGenerationService();
    service.setShouldFail(true);

    await expect(
      generateStepQuizzes(
        { roadmapId: ROADMAP_ID, steps: [makeStep("c1", "X", 0)] },
        { service },
      ),
    ).rejects.toThrow("Step quiz generation failed");
  });

  it("passes concept description to service input", async () => {
    const service = new FakeStepQuizGenerationService();
    const steps = [makeStep("c1", "Linear Algebra", 0)];

    await generateStepQuizzes({ roadmapId: ROADMAP_ID, steps }, { service });

    expect(service.lastInput[0].conceptDescription).toBe(
      "Description of Linear Algebra",
    );
  });
});
