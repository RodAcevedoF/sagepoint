import { ResourceDiscoveryProcessorService } from "../../../src/roadmap-processor/resource-discovery-processor.service";
import { FakeLogger } from "../_fakes/logger.fake";
import {
  FakeRoadmapRepository,
  FakeResourceRepository,
} from "../_fakes/repositories.fake";
import {
  FakeResourceDiscoveryService,
  FakeStepQuizGenerationService,
  FakeStepQuizQuestionRepository,
} from "../_fakes/services.fake";
import { Concept, Roadmap } from "@sagepoint/domain";
import type { RoadmapStep } from "@sagepoint/domain";

const ROADMAP_ID = "roadmap-001";

function makeConcept(id: string, name: string): Concept {
  return new Concept(id, name, undefined, `Description of ${name}`);
}

function makeStep(conceptId: string, name: string, order: number): RoadmapStep {
  return {
    concept: makeConcept(conceptId, name),
    order,
    dependsOn: [],
    learningObjective: `Learn ${name}`,
    rationale: `Why ${name} matters`,
    difficulty: "intermediate",
  };
}

function makeRoadmapWithSteps(steps: RoadmapStep[]): Roadmap {
  return new Roadmap({
    id: ROADMAP_ID,
    title: "Test Roadmap",
    documentId: "doc-001",
    userId: "user-001",
    steps,
    generationStatus: "completed",
    resourcesStatus: "pending",
    isFeatured: false,
    visibility: "PRIVATE" as never,
    createdAt: new Date(),
  });
}

function buildService(overrides?: {
  roadmapRepo?: FakeRoadmapRepository;
  enrichmentService?: FakeStepQuizGenerationService;
  stepQuizQuestionRepo?: FakeStepQuizQuestionRepository;
  resourceDiscovery?: FakeResourceDiscoveryService;
}) {
  const roadmapRepo = overrides?.roadmapRepo ?? new FakeRoadmapRepository();
  const resourceRepo = new FakeResourceRepository();
  const resourceDiscovery =
    overrides?.resourceDiscovery ?? new FakeResourceDiscoveryService();
  const enrichmentService =
    overrides?.enrichmentService ?? new FakeStepQuizGenerationService();
  const stepQuizQuestionRepo =
    overrides?.stepQuizQuestionRepo ?? new FakeStepQuizQuestionRepository();

  const service = new ResourceDiscoveryProcessorService(
    new FakeLogger() as never,
    roadmapRepo,
    resourceRepo,
    resourceDiscovery,
    enrichmentService,
    stepQuizQuestionRepo,
  );

  return {
    service,
    roadmapRepo,
    resourceRepo,
    enrichmentService,
    stepQuizQuestionRepo,
  };
}

describe("ResourceDiscoveryProcessorService", () => {
  const STEPS = [
    makeStep("c1", "Linear Algebra", 0),
    makeStep("c2", "Calculus", 1),
  ];

  describe("enrichment after resource discovery", () => {
    it("runs enrichment and saves enriched questions", async () => {
      const roadmapRepo = new FakeRoadmapRepository();
      roadmapRepo.seedRoadmap(ROADMAP_ID);

      const enrichmentService = new FakeStepQuizGenerationService();
      const stepQuizQuestionRepo = new FakeStepQuizQuestionRepository();

      const { service } = buildService({
        roadmapRepo,
        enrichmentService,
        stepQuizQuestionRepo,
      });

      // Override findById to return a roadmap with steps
      roadmapRepo.findById = () => Promise.resolve(makeRoadmapWithSteps(STEPS));

      await service.discoverResources(ROADMAP_ID);

      expect(enrichmentService.lastInput).toHaveLength(2);
      expect(stepQuizQuestionRepo.getSaved().length).toBeGreaterThan(0);
    });

    it("passes resourceSnippets from discovered resources to enrichment", async () => {
      const roadmapRepo = new FakeRoadmapRepository();
      roadmapRepo.seedRoadmap(ROADMAP_ID);

      const resourceDiscovery = new FakeResourceDiscoveryService();
      resourceDiscovery.setResults([
        {
          title: "LA Course",
          url: "https://example.com",
          type: "ARTICLE" as never,
          description: "A great LA resource",
        },
      ]);

      const enrichmentService = new FakeStepQuizGenerationService();
      const stepQuizQuestionRepo = new FakeStepQuizQuestionRepository();

      const { service } = buildService({
        roadmapRepo,
        resourceDiscovery,
        enrichmentService,
        stepQuizQuestionRepo,
      });
      roadmapRepo.findById = () => Promise.resolve(makeRoadmapWithSteps(STEPS));

      await service.discoverResources(ROADMAP_ID);

      const snippets = enrichmentService.lastInput[0].resourceSnippets ?? [];
      expect(snippets).toContain("A great LA resource");
    });

    it("calls deleteByRoadmapId before saveMany to replace old questions", async () => {
      const roadmapRepo = new FakeRoadmapRepository();
      roadmapRepo.seedRoadmap(ROADMAP_ID);

      const stepQuizQuestionRepo = new FakeStepQuizQuestionRepository();
      const callOrder: string[] = [];
      const origDelete: FakeStepQuizQuestionRepository["deleteByRoadmapId"] = (
        id,
      ) =>
        FakeStepQuizQuestionRepository.prototype.deleteByRoadmapId.apply(
          stepQuizQuestionRepo,
          [id],
        ) as Promise<void>;
      const origSave: FakeStepQuizQuestionRepository["saveMany"] = (items) =>
        FakeStepQuizQuestionRepository.prototype.saveMany.apply(
          stepQuizQuestionRepo,
          [items],
        ) as ReturnType<FakeStepQuizQuestionRepository["saveMany"]>;
      stepQuizQuestionRepo.deleteByRoadmapId = (id) => {
        callOrder.push("delete");
        return origDelete(id);
      };
      stepQuizQuestionRepo.saveMany = (items) => {
        callOrder.push("save");
        return origSave(items);
      };

      const { service } = buildService({ roadmapRepo, stepQuizQuestionRepo });
      roadmapRepo.findById = () => Promise.resolve(makeRoadmapWithSteps(STEPS));

      await service.discoverResources(ROADMAP_ID);

      expect(callOrder).toEqual(["delete", "save"]);
    });

    it("does not fail resource discovery when enrichment throws", async () => {
      const roadmapRepo = new FakeRoadmapRepository();
      roadmapRepo.seedRoadmap(ROADMAP_ID);

      const enrichmentService = new FakeStepQuizGenerationService();
      enrichmentService.setShouldFail(true);

      const { service, stepQuizQuestionRepo } = buildService({
        roadmapRepo,
        enrichmentService,
      });
      roadmapRepo.findById = () => Promise.resolve(makeRoadmapWithSteps(STEPS));

      await expect(
        service.discoverResources(ROADMAP_ID),
      ).resolves.not.toThrow();
      expect(stepQuizQuestionRepo.getSaved()).toHaveLength(0);
    });
  });

  describe("when roadmap not found", () => {
    it("marks resource status as failed and returns without enrichment", async () => {
      const roadmapRepo = new FakeRoadmapRepository();
      roadmapRepo.seedRoadmap(ROADMAP_ID);

      const enrichmentService = new FakeStepQuizGenerationService();
      const { service } = buildService({ roadmapRepo, enrichmentService });

      await service.discoverResources(ROADMAP_ID);

      expect(enrichmentService.lastInput).toHaveLength(0);
    });
  });
});
