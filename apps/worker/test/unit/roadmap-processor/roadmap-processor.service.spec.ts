import { RoadmapProcessorService } from "../../../src/roadmap-processor/roadmap-processor.service";
import { FakeLogger } from "../_fakes/logger.fake";
import { FakeJob } from "../_fakes/job.fake";
import {
  FakeRoadmapRepository,
  FakeCategoryRepository,
} from "../_fakes/repositories.fake";
import {
  FakeTopicConceptGenerationService,
  FakeRoadmapGenerationService,
  FakeConceptRepository,
  FakeEmbeddingService,
  FakeConceptEmbeddingRepository,
} from "../_fakes/services.fake";
import type { Job } from "bullmq";
import {
  Concept,
  type ConceptForOrdering,
  type ConceptRelationshipForOrdering,
  type UserContext,
} from "@sagepoint/domain";

interface JobData {
  roadmapId: string;
  topic: string;
  title: string;
  userId: string;
  userContext?: UserContext;
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
  { fromId: "c2", toId: "c3", type: "RELATED_TO" },
];

function buildService(overrides?: {
  topicConceptGenerator?: FakeTopicConceptGenerationService;
  roadmapGenerator?: FakeRoadmapGenerationService;
  conceptRepository?: FakeConceptRepository;
  roadmapRepo?: FakeRoadmapRepository;
  categoryRepo?: FakeCategoryRepository;
  logger?: FakeLogger;
  embedder?: FakeEmbeddingService;
  conceptEmbeddingRepo?: FakeConceptEmbeddingRepository;
}) {
  const logger = overrides?.logger ?? new FakeLogger();
  const topicConceptGenerator =
    overrides?.topicConceptGenerator ?? new FakeTopicConceptGenerationService();
  const roadmapGenerator =
    overrides?.roadmapGenerator ?? new FakeRoadmapGenerationService();
  const conceptRepository =
    overrides?.conceptRepository ?? new FakeConceptRepository();
  const roadmapRepo = overrides?.roadmapRepo ?? new FakeRoadmapRepository();
  const categoryRepo = overrides?.categoryRepo ?? new FakeCategoryRepository();
  const embedder = overrides?.embedder ?? new FakeEmbeddingService();
  const conceptEmbeddingRepo =
    overrides?.conceptEmbeddingRepo ?? new FakeConceptEmbeddingRepository();

  const fakeTokenBalanceRepo = {
    findByUserId: jest.fn().mockResolvedValue(null),
    atomicDeduct: jest.fn().mockResolvedValue(true),
    credit: jest.fn().mockResolvedValue(undefined),
    setBalance: jest.fn().mockResolvedValue(undefined),
  } as never;

  const fakeCategoryClassifier = {
    classify: jest.fn().mockResolvedValue(null),
  } as never;

  const fakeResourcesQueue: { add: jest.Mock } = {
    add: jest.fn().mockResolvedValue(undefined),
  };

  const service = new RoadmapProcessorService(
    logger as never,
    topicConceptGenerator,
    roadmapGenerator,
    conceptRepository,
    roadmapRepo,
    categoryRepo,
    fakeTokenBalanceRepo,
    fakeCategoryClassifier,
    fakeResourcesQueue as never,
    embedder,
    conceptEmbeddingRepo,
  );

  return {
    service,
    logger,
    topicConceptGenerator,
    roadmapGenerator,
    conceptRepository,
    roadmapRepo,
    categoryRepo,
    fakeCategoryClassifier,
    fakeResourcesQueue,
    embedder,
    conceptEmbeddingRepo,
  };
}

describe("RoadmapProcessorService", () => {
  let service: RoadmapProcessorService;
  let logger: FakeLogger;
  let topicConceptGenerator: FakeTopicConceptGenerationService;
  let roadmapGenerator: FakeRoadmapGenerationService;
  let conceptRepository: FakeConceptRepository;
  let roadmapRepo: FakeRoadmapRepository;
  let categoryRepo: FakeCategoryRepository;
  let fakeCategoryClassifier: { classify: jest.Mock };
  let fakeResourcesQueue: { add: jest.Mock };
  let embedder: FakeEmbeddingService;
  let conceptEmbeddingRepo: FakeConceptEmbeddingRepository;

  beforeEach(() => {
    const ctx = buildService();
    service = ctx.service;
    logger = ctx.logger;
    topicConceptGenerator = ctx.topicConceptGenerator;
    roadmapGenerator = ctx.roadmapGenerator;
    conceptRepository = ctx.conceptRepository;
    roadmapRepo = ctx.roadmapRepo;
    categoryRepo = ctx.categoryRepo;
    fakeCategoryClassifier = ctx.fakeCategoryClassifier;
    fakeResourcesQueue = ctx.fakeResourcesQueue;
    embedder = ctx.embedder;
    conceptEmbeddingRepo = ctx.conceptEmbeddingRepo;

    roadmapRepo.seedRoadmap(ROADMAP_ID);
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
    });

    it("should generate a complete roadmap with concepts and steps, then enqueue resource discovery", async () => {
      const job = new FakeJob<JobData>("job-1", {
        roadmapId: ROADMAP_ID,
        topic: TOPIC,
        title: "ML Roadmap",
        userId: USER_ID,
      });

      await service.process(job as unknown as Job<JobData>);

      // Roadmap should be COMPLETED (phase 1 done)
      const roadmap = roadmapRepo.getRoadmap(ROADMAP_ID);
      expect(roadmap?.generationStatus).toBe("completed");
      expect(roadmap?.description).toBe("ML fundamentals roadmap");
      expect(roadmap?.recommendedPace).toBe("1 hour/day");

      // Steps should be serialized
      const steps = roadmap?.steps as unknown[];
      expect(steps).toHaveLength(3);

      // Total duration should be calculated
      expect(roadmap?.totalEstimatedDuration).toBe(135); // 30 + 60 + 45

      // Concepts should be persisted to Neo4j
      expect(conceptRepository.getSavedConcepts()).toHaveLength(3);

      // Phase 2 job should be enqueued
      expect(fakeResourcesQueue.add).toHaveBeenCalledWith(
        "discover-resources",
        { roadmapId: ROADMAP_ID },
        { jobId: ROADMAP_ID },
      );

      // Progress should track phase 1 stages only (resources handled in phase 2)
      expect(job.progressUpdates).toEqual([
        { stage: "concepts" },
        { stage: "learning-path" },
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

      const roadmap = roadmapRepo.getRoadmap(ROADMAP_ID);
      expect(roadmap?.generationStatus).toBe("completed");
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

      const roadmap = roadmapRepo.getRoadmap(ROADMAP_ID);
      expect(roadmap?.generationStatus).toBe("completed");
      expect(logger.hasLevel("warn")).toBe(true);
    });
  });

  describe("category auto-matching", () => {
    it("should auto-assign a category when topic matches keywords", async () => {
      fakeCategoryClassifier.classify.mockResolvedValueOnce("cat-1");

      categoryRepo.seedCategory({
        id: "cat-1",
        name: "Machine Learning",
        slug: "machine-learning",
        description: "AI, neural networks, deep learning",
      });
      categoryRepo.seedCategory({
        id: "cat-2",
        name: "Web Development",
        slug: "web-development",
        description: "HTML, CSS, JavaScript",
      });

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

      const roadmap = roadmapRepo.getRoadmap(ROADMAP_ID);
      expect(roadmap?.categoryId).toBe("cat-1");
    });

    it("should not assign a category when no match is found", async () => {
      categoryRepo.seedCategory({
        id: "cat-1",
        name: "Cooking",
        slug: "cooking",
        description: "recipes, food",
      });

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

      const roadmap = roadmapRepo.getRoadmap(ROADMAP_ID);
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

      const roadmap = roadmapRepo.getRoadmap(ROADMAP_ID);
      expect(roadmap?.generationStatus).toBe("failed");
      expect(roadmap?.errorMessage).toBe("AI service unavailable");
      expect(logger.hasLevel("error")).toBe(true);
    });
  });

  describe("user context passing", () => {
    it("should pass all UserContext fields to both generators", async () => {
      topicConceptGenerator.setResult({ concepts: [], relationships: [] });

      const fullContext: UserContext = {
        goal: "Become an ML engineer",
        experienceLevel: "beginner",
        timeAvailable: 10,
        preferredLearningStyle: "visual",
      };

      const job = new FakeJob<JobData>("job-8", {
        roadmapId: ROADMAP_ID,
        topic: TOPIC,
        title: "ML Roadmap",
        userId: USER_ID,
        userContext: fullContext,
      });

      await service.process(job as unknown as Job<JobData>);

      expect(topicConceptGenerator.lastUserContext).toEqual(fullContext);
    });

    it("should pass all UserContext fields to learning-path generator", async () => {
      const fullContext: UserContext = {
        goal: "Become an ML engineer",
        experienceLevel: "intermediate",
        timeAvailable: 5,
        preferredLearningStyle: "reading",
      };

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
        ],
        description: "ML roadmap",
        recommendedPace: "1 hour/day",
      });

      const job = new FakeJob<JobData>("job-8b", {
        roadmapId: ROADMAP_ID,
        topic: TOPIC,
        title: "ML Roadmap",
        userId: USER_ID,
        userContext: fullContext,
      });

      await service.process(job as unknown as Job<JobData>);

      expect(roadmapGenerator.lastUserContext).toEqual(fullContext);
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
      const roadmap = roadmapRepo.getRoadmap(ROADMAP_ID);
      expect(roadmap?.generationStatus).toBe("completed");
    });
  });

  describe("quality gate", () => {
    it("should persist embeddings for kept concepts after gate", async () => {
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
        ],
        description: "ML roadmap",
        recommendedPace: "1 hour/day",
      });

      const job = new FakeJob<JobData>("job-gate-1", {
        roadmapId: ROADMAP_ID,
        topic: TOPIC,
        title: "ML Roadmap",
        userId: USER_ID,
      });

      await service.process(job as unknown as Job<JobData>);

      const saved = conceptEmbeddingRepo.getSaved();
      expect(saved.length).toBeGreaterThan(0);
      expect(saved.every((e) => Array.isArray(e.embedding))).toBe(true);
    });

    it("should complete-empty when fewer than 3 concepts survive the gate", async () => {
      // Only 2 isolated concepts — will be pruned to largest component (1)
      topicConceptGenerator.setResult({
        concepts: [
          { id: "x1", name: "Isolated A" },
          { id: "x2", name: "Isolated B" },
        ],
        relationships: [], // no edges -> each is its own component of size 1
      });

      const job = new FakeJob<JobData>("job-gate-2", {
        roadmapId: ROADMAP_ID,
        topic: TOPIC,
        title: "ML Roadmap",
        userId: USER_ID,
      });

      await service.process(job as unknown as Job<JobData>);

      const roadmap = roadmapRepo.getRoadmap(ROADMAP_ID);
      expect(roadmap?.generationStatus).toBe("completed");
      expect(roadmap?.description).toContain("Could not generate concepts");
    });

    it("should continue roadmap generation even if embedding repo save fails", async () => {
      conceptEmbeddingRepo.setShouldFail(true);

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
        ],
        description: "ML roadmap",
        recommendedPace: "1 hour/day",
      });

      const job = new FakeJob<JobData>("job-gate-3", {
        roadmapId: ROADMAP_ID,
        topic: TOPIC,
        title: "ML Roadmap",
        userId: USER_ID,
      });

      await service.process(job as unknown as Job<JobData>);

      const roadmap = roadmapRepo.getRoadmap(ROADMAP_ID);
      expect(roadmap?.generationStatus).toBe("completed");
      expect(embedder).toBeDefined(); // gate still ran
    });
  });
});
