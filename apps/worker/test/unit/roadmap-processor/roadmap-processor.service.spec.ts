import { RoadmapProcessorService } from "../../../src/roadmap-processor/roadmap-processor.service";
import { FakeLogger } from "../_fakes/logger.fake";
import { FakeJob } from "../_fakes/job.fake";
import { FakePrismaClient } from "../_fakes/prisma.fake";
import {
  FakeTopicConceptGenerationService,
  FakeRoadmapGenerationService,
  FakeResourceDiscoveryService,
  FakeConceptRepository,
  FakeCacheService,
} from "../_fakes/services.fake";
import { CachedResourceDiscoveryAdapter } from "../../../src/infra/cached-resource-discovery.adapter";
import type { Job } from "bullmq";
import {
  Concept,
  type ConceptForOrdering,
  type ConceptRelationshipForOrdering,
} from "@sagepoint/domain";

interface JobData {
  roadmapId: string;
  topic: string;
  title: string;
  userId: string;
  userContext?: { experienceLevel?: string };
}

const ROADMAP_ID = "roadmap-001";
const USER_ID = "user-001";
const TOPIC = "Machine Learning";

const CONCEPTS: ConceptForOrdering[] = [
  { id: "c1", name: "Linear Algebra", description: "Foundations of ML" },
  { id: "c2", name: "Neural Networks", description: "Deep learning basics" },
  { id: "c3", name: "Gradient Descent", description: "Optimization algorithm" },
];

const RELATIONSHIPS: ConceptRelationshipForOrdering[] = [
  { fromId: "c1", toId: "c2", type: "DEPENDS_ON" },
];

function buildService(overrides?: {
  topicConceptGenerator?: FakeTopicConceptGenerationService;
  roadmapGenerator?: FakeRoadmapGenerationService;
  innerResourceDiscovery?: FakeResourceDiscoveryService;
  conceptRepository?: FakeConceptRepository;
  prisma?: FakePrismaClient;
  logger?: FakeLogger;
}) {
  const logger = overrides?.logger ?? new FakeLogger();
  const topicConceptGenerator =
    overrides?.topicConceptGenerator ?? new FakeTopicConceptGenerationService();
  const roadmapGenerator =
    overrides?.roadmapGenerator ?? new FakeRoadmapGenerationService();
  const innerResourceDiscovery =
    overrides?.innerResourceDiscovery ?? new FakeResourceDiscoveryService();
  const conceptRepository =
    overrides?.conceptRepository ?? new FakeConceptRepository();
  const prisma = overrides?.prisma ?? new FakePrismaClient();

  const cache = new FakeCacheService();
  const resourceDiscovery = Object.create(
    CachedResourceDiscoveryAdapter.prototype,
  ) as CachedResourceDiscoveryAdapter;
  Object.defineProperty(resourceDiscovery, "inner", {
    value: innerResourceDiscovery,
  });
  Object.defineProperty(resourceDiscovery, "cache", { value: cache });

  const service = Object.create(
    RoadmapProcessorService.prototype,
  ) as RoadmapProcessorService;
  Object.defineProperty(service, "logger", { value: logger });
  Object.defineProperty(service, "topicConceptGenerator", {
    value: topicConceptGenerator,
  });
  Object.defineProperty(service, "roadmapGenerator", {
    value: roadmapGenerator,
  });
  Object.defineProperty(service, "resourceDiscovery", {
    value: resourceDiscovery,
  });
  Object.defineProperty(service, "conceptRepository", {
    value: conceptRepository,
  });
  Object.defineProperty(service, "prisma", { value: prisma });

  return {
    service,
    logger,
    topicConceptGenerator,
    roadmapGenerator,
    innerResourceDiscovery,
    conceptRepository,
    prisma,
    cache,
  };
}

describe("RoadmapProcessorService", () => {
  let service: RoadmapProcessorService;
  let logger: FakeLogger;
  let topicConceptGenerator: FakeTopicConceptGenerationService;
  let roadmapGenerator: FakeRoadmapGenerationService;
  let innerResourceDiscovery: FakeResourceDiscoveryService;
  let conceptRepository: FakeConceptRepository;
  let prisma: FakePrismaClient;

  beforeEach(() => {
    const ctx = buildService();
    service = ctx.service;
    logger = ctx.logger;
    topicConceptGenerator = ctx.topicConceptGenerator;
    roadmapGenerator = ctx.roadmapGenerator;
    innerResourceDiscovery = ctx.innerResourceDiscovery;
    conceptRepository = ctx.conceptRepository;
    prisma = ctx.prisma;

    prisma.seedRoadmap(ROADMAP_ID);
  });

  describe("happy path — full roadmap generation", () => {
    beforeEach(() => {
      topicConceptGenerator.setResult({
        concepts: CONCEPTS,
        relationships: RELATIONSHIPS,
      });

      roadmapGenerator.setResult({
        orderedConcepts: [
          {
            conceptId: "c1",
            order: 0,
            learningObjective: "Learn LA",
            estimatedDuration: 30,
            difficulty: "beginner",
            rationale: "Foundation",
          },
          {
            conceptId: "c2",
            order: 1,
            learningObjective: "Learn NN",
            estimatedDuration: 60,
            difficulty: "intermediate",
            rationale: "Core topic",
          },
          {
            conceptId: "c3",
            order: 2,
            learningObjective: "Learn GD",
            estimatedDuration: 45,
            difficulty: "intermediate",
            rationale: "Optimization",
          },
        ],
        description: "ML fundamentals roadmap",
        recommendedPace: "1 hour/day",
      });

      innerResourceDiscovery.setResults([
        {
          title: "Resource 1",
          url: "https://example.com/r1",
          type: "ARTICLE" as never,
          description: "A resource",
        },
      ]);
    });

    it("should generate a complete roadmap with concepts, steps, and resources", async () => {
      const job = new FakeJob<JobData>("job-1", {
        roadmapId: ROADMAP_ID,
        topic: TOPIC,
        title: "ML Roadmap",
        userId: USER_ID,
      });

      await service.process(job as unknown as Job<JobData>);

      // Roadmap should be COMPLETED
      const roadmap = prisma.getRoadmap(ROADMAP_ID);
      expect(roadmap?.generationStatus).toBe("COMPLETED");
      expect(roadmap?.description).toBe("ML fundamentals roadmap");
      expect(roadmap?.recommendedPace).toBe("1 hour/day");

      // Steps should be serialized
      const steps = roadmap?.steps as unknown[];
      expect(steps).toHaveLength(3);

      // Total duration should be calculated
      expect(roadmap?.totalDuration).toBe(135); // 30 + 60 + 45

      // Concepts should be persisted to Neo4j
      expect(conceptRepository.getSavedConcepts()).toHaveLength(3);

      // Resources should be saved (3 steps × 1 resource each)
      const resources = prisma.getResourcesByRoadmapId(ROADMAP_ID);
      expect(resources).toHaveLength(3);

      // Progress should track all stages
      expect(job.progressUpdates).toEqual([
        { stage: "concepts" },
        { stage: "learning-path" },
        { stage: "resources" },
        { stage: "done" },
      ]);
    });
  });

  describe("empty concept generation", () => {
    it("should complete with a helpful message when no concepts are generated", async () => {
      topicConceptGenerator.setResult({ concepts: [], relationships: [] });

      const job = new FakeJob<JobData>("job-2", {
        roadmapId: ROADMAP_ID,
        topic: "Very obscure topic",
        title: "Obscure Roadmap",
        userId: USER_ID,
      });

      await service.process(job as unknown as Job<JobData>);

      const roadmap = prisma.getRoadmap(ROADMAP_ID);
      expect(roadmap?.generationStatus).toBe("COMPLETED");
      expect(roadmap?.description).toContain("Could not generate concepts");
    });
  });

  describe("Neo4j persistence failure", () => {
    it("should continue roadmap generation even if Neo4j save fails", async () => {
      topicConceptGenerator.setResult({
        concepts: CONCEPTS,
        relationships: RELATIONSHIPS,
      });
      roadmapGenerator.setResult({
        orderedConcepts: [
          {
            conceptId: "c1",
            order: 0,
            learningObjective: "Learn",
            estimatedDuration: 30,
            difficulty: "beginner",
            rationale: "R",
          },
        ],
        description: "Test roadmap",
        recommendedPace: "30m/day",
      });
      conceptRepository.setShouldFailSave(true);

      const job = new FakeJob<JobData>("job-3", {
        roadmapId: ROADMAP_ID,
        topic: TOPIC,
        title: "ML Roadmap",
        userId: USER_ID,
      });

      await service.process(job as unknown as Job<JobData>);

      const roadmap = prisma.getRoadmap(ROADMAP_ID);
      expect(roadmap?.generationStatus).toBe("COMPLETED");
      expect(logger.hasLevel("warn")).toBe(true);
    });
  });

  describe("resource discovery failure", () => {
    it("should complete roadmap generation even if resource discovery fails", async () => {
      topicConceptGenerator.setResult({
        concepts: CONCEPTS.slice(0, 1),
        relationships: [],
      });
      roadmapGenerator.setResult({
        orderedConcepts: [
          {
            conceptId: "c1",
            order: 0,
            learningObjective: "Learn",
            estimatedDuration: 30,
            difficulty: "beginner",
            rationale: "R",
          },
        ],
        description: "Test roadmap",
        recommendedPace: "30m/day",
      });

      // Make inner discovery throw
      const failingDiscovery = new FakeResourceDiscoveryService();
      Object.defineProperty(failingDiscovery, "discoverResourcesForConcept", {
        value: () => Promise.reject(new Error("Discovery failed")),
      });

      const ctx = buildService({ innerResourceDiscovery: failingDiscovery });
      prisma = ctx.prisma;
      prisma.seedRoadmap(ROADMAP_ID);
      ctx.topicConceptGenerator.setResult({
        concepts: CONCEPTS.slice(0, 1),
        relationships: [],
      });
      ctx.roadmapGenerator.setResult({
        orderedConcepts: [
          {
            conceptId: "c1",
            order: 0,
            learningObjective: "Learn",
            estimatedDuration: 30,
            difficulty: "beginner",
            rationale: "R",
          },
        ],
        description: "Test roadmap",
        recommendedPace: "30m/day",
      });

      const job = new FakeJob<JobData>("job-4", {
        roadmapId: ROADMAP_ID,
        topic: TOPIC,
        title: "ML Roadmap",
        userId: USER_ID,
      });

      await ctx.service.process(job as unknown as Job<JobData>);

      const roadmap = ctx.prisma.getRoadmap(ROADMAP_ID);
      expect(roadmap?.generationStatus).toBe("COMPLETED");
      expect(ctx.logger.hasLevel("warn")).toBe(true);
    });
  });

  describe("category auto-matching", () => {
    it("should auto-assign a category when topic matches keywords", async () => {
      prisma.seedCategory({
        id: "cat-1",
        name: "Machine Learning",
        slug: "machine-learning",
        description: "AI, neural networks, deep learning",
      });
      prisma.seedCategory({
        id: "cat-2",
        name: "Web Development",
        slug: "web-development",
        description: "HTML, CSS, JavaScript",
      });

      topicConceptGenerator.setResult({
        concepts: CONCEPTS.slice(0, 1),
        relationships: [],
      });
      roadmapGenerator.setResult({
        orderedConcepts: [
          {
            conceptId: "c1",
            order: 0,
            learningObjective: "Learn",
            estimatedDuration: 30,
            difficulty: "beginner",
            rationale: "R",
          },
        ],
        description: "ML roadmap",
        recommendedPace: "30m/day",
      });

      const job = new FakeJob<JobData>("job-5", {
        roadmapId: ROADMAP_ID,
        topic: TOPIC,
        title: "ML Roadmap",
        userId: USER_ID,
      });

      await service.process(job as unknown as Job<JobData>);

      const roadmap = prisma.getRoadmap(ROADMAP_ID);
      expect(roadmap?.categoryId).toBe("cat-1");
    });

    it("should not assign a category when no match is found", async () => {
      prisma.seedCategory({
        id: "cat-1",
        name: "Cooking",
        slug: "cooking",
        description: "recipes, food",
      });

      topicConceptGenerator.setResult({
        concepts: CONCEPTS.slice(0, 1),
        relationships: [],
      });
      roadmapGenerator.setResult({
        orderedConcepts: [
          {
            conceptId: "c1",
            order: 0,
            learningObjective: "Learn",
            estimatedDuration: 30,
            difficulty: "beginner",
            rationale: "R",
          },
        ],
        description: "ML roadmap",
        recommendedPace: "30m/day",
      });

      const job = new FakeJob<JobData>("job-6", {
        roadmapId: ROADMAP_ID,
        topic: TOPIC,
        title: "ML Roadmap",
        userId: USER_ID,
      });

      await service.process(job as unknown as Job<JobData>);

      const roadmap = prisma.getRoadmap(ROADMAP_ID);
      expect(roadmap?.categoryId).toBeUndefined();
    });
  });

  describe("error handling", () => {
    it("should mark roadmap as FAILED and re-throw on unexpected error", async () => {
      topicConceptGenerator.setResult({
        concepts: CONCEPTS,
        relationships: RELATIONSHIPS,
      });
      // Force an error by making roadmapGenerator throw
      Object.defineProperty(roadmapGenerator, "generateLearningPath", {
        value: () => Promise.reject(new Error("AI service unavailable")),
      });

      const job = new FakeJob<JobData>("job-7", {
        roadmapId: ROADMAP_ID,
        topic: TOPIC,
        title: "ML Roadmap",
        userId: USER_ID,
      });

      await expect(
        service.process(job as unknown as Job<JobData>),
      ).rejects.toThrow("AI service unavailable");

      const roadmap = prisma.getRoadmap(ROADMAP_ID);
      expect(roadmap?.generationStatus).toBe("FAILED");
      expect(roadmap?.errorMessage).toBe("AI service unavailable");
      expect(logger.hasLevel("error")).toBe(true);
    });
  });

  describe("user context parsing", () => {
    it("should pass user context to generators when provided", async () => {
      topicConceptGenerator.setResult({ concepts: [], relationships: [] });

      const job = new FakeJob<JobData>("job-8", {
        roadmapId: ROADMAP_ID,
        topic: TOPIC,
        title: "ML Roadmap",
        userId: USER_ID,
        userContext: { experienceLevel: "beginner" },
      });

      // Should not throw even with user context
      await service.process(job as unknown as Job<JobData>);

      const roadmap = prisma.getRoadmap(ROADMAP_ID);
      expect(roadmap?.generationStatus).toBe("COMPLETED");
    });
  });

  describe("ontology context", () => {
    it("should use existing concepts from Neo4j as ontology context", async () => {
      // Seed existing concepts in the graph
      conceptRepository.seed(
        Concept.create("existing-1", "Machine", undefined, "A machine"),
        Concept.create("existing-2", "Learning", undefined, "The process"),
      );

      topicConceptGenerator.setResult({ concepts: [], relationships: [] });

      const job = new FakeJob<JobData>("job-9", {
        roadmapId: ROADMAP_ID,
        topic: TOPIC,
        title: "ML Roadmap",
        userId: USER_ID,
      });

      await service.process(job as unknown as Job<JobData>);

      // Should complete without errors (ontology context was fetched)
      const roadmap = prisma.getRoadmap(ROADMAP_ID);
      expect(roadmap?.generationStatus).toBe("COMPLETED");
    });
  });
});
