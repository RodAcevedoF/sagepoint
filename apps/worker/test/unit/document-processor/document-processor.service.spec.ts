import { DocumentProcessorService } from "../../../src/document-processor/document-processor.service";
import { FakeLogger } from "../_fakes/logger.fake";
import { FakeJob } from "../_fakes/job.fake";
import {
  FakeDocumentRepository,
  FakeDocumentSummaryRepository,
  FakeQuizRepository,
  FakeQuestionRepository,
} from "../_fakes/repositories.fake";
import {
  FakeFileStorage,
  FakeContentAnalysisService,
  FakeDocumentAnalysisService,
  FakeQuizGenerationService,
  FakeImageTextExtractionService,
  FakeConceptRepository,
} from "../_fakes/services.fake";
import type { Job } from "bullmq";

interface ProcessDocumentJobData {
  documentId: string;
  storagePath: string;
  filename: string;
  mimeType?: string;
}

interface EnrichDocumentJobData {
  documentId: string;
  text: string;
  topicArea: string;
}

const DOC_ID = "doc-001";
const STORAGE_PATH = "uploads/doc-001.pdf";
const FILENAME = "test-document.pdf";
const SAMPLE_TEXT = "Hello World document content";

function buildService(overrides: {
  logger?: FakeLogger;
  contentAnalysis?: FakeContentAnalysisService;
  documentAnalysis?: FakeDocumentAnalysisService;
  quizGeneration?: FakeQuizGenerationService;
  visionExtractor?: FakeImageTextExtractionService;
  fileStorage?: FakeFileStorage;
  conceptRepository?: FakeConceptRepository;
  documentRepo?: FakeDocumentRepository;
  summaryRepo?: FakeDocumentSummaryRepository;
  quizRepo?: FakeQuizRepository;
  questionRepo?: FakeQuestionRepository;
}) {
  const logger = overrides.logger ?? new FakeLogger();
  const contentAnalysis =
    overrides.contentAnalysis ?? new FakeContentAnalysisService();
  const documentAnalysis =
    overrides.documentAnalysis ?? new FakeDocumentAnalysisService();
  const quizGeneration =
    overrides.quizGeneration ?? new FakeQuizGenerationService();
  const visionExtractor =
    overrides.visionExtractor ?? new FakeImageTextExtractionService();
  const fileStorage = overrides.fileStorage ?? new FakeFileStorage();
  const conceptRepository =
    overrides.conceptRepository ?? new FakeConceptRepository();
  const documentRepo = overrides.documentRepo ?? new FakeDocumentRepository();
  const summaryRepo =
    overrides.summaryRepo ?? new FakeDocumentSummaryRepository();
  const quizRepo = overrides.quizRepo ?? new FakeQuizRepository();
  const questionRepo = overrides.questionRepo ?? new FakeQuestionRepository();

  const fakeQueue = { add: jest.fn().mockResolvedValue(undefined) } as never;

  const service = new DocumentProcessorService(
    logger as never,
    fakeQueue,
    contentAnalysis,
    documentAnalysis,
    quizGeneration,
    visionExtractor,
    fileStorage,
    conceptRepository,
    documentRepo,
    summaryRepo,
    quizRepo,
    questionRepo,
  );

  return {
    service,
    fakeQueue,
    logger,
    contentAnalysis,
    documentAnalysis,
    quizGeneration,
    visionExtractor,
    fileStorage,
    conceptRepository,
    documentRepo,
    summaryRepo,
    quizRepo,
    questionRepo,
  };
}

describe("DocumentProcessorService", () => {
  let service: DocumentProcessorService;
  let fakeQueue: { add: jest.Mock };
  let logger: FakeLogger;
  let contentAnalysis: FakeContentAnalysisService;
  let documentAnalysis: FakeDocumentAnalysisService;
  let quizGeneration: FakeQuizGenerationService;
  let visionExtractor: FakeImageTextExtractionService;
  let fileStorage: FakeFileStorage;
  let conceptRepository: FakeConceptRepository;
  let documentRepo: FakeDocumentRepository;
  let summaryRepo: FakeDocumentSummaryRepository;
  let quizRepo: FakeQuizRepository;

  beforeEach(() => {
    const ctx = buildService({});
    service = ctx.service;
    fakeQueue = ctx.fakeQueue;
    logger = ctx.logger;
    contentAnalysis = ctx.contentAnalysis;
    documentAnalysis = ctx.documentAnalysis;
    quizGeneration = ctx.quizGeneration;
    visionExtractor = ctx.visionExtractor;
    fileStorage = ctx.fileStorage;
    conceptRepository = ctx.conceptRepository;
    documentRepo = ctx.documentRepo;
    summaryRepo = ctx.summaryRepo;
    quizRepo = ctx.quizRepo;

    fileStorage.seed(STORAGE_PATH, Buffer.from(SAMPLE_TEXT));
    documentRepo.seedDocument(DOC_ID);
  });

  // ─── Job 1: process-document ───────────────────────────────────────────────

  describe("Job 1 (process-document) — parse + analyze", () => {
    it("should parse, analyze, save summary, and enqueue enrichment job", async () => {
      const job = new FakeJob<ProcessDocumentJobData>(
        "job-1",
        {
          documentId: DOC_ID,
          storagePath: STORAGE_PATH,
          filename: FILENAME,
          mimeType: "text/plain",
        },
        "process-document",
      );

      await service.process(job as unknown as Job);

      const doc = documentRepo.getDocument(DOC_ID);
      expect(doc?.processingStage).toBe("SUMMARIZED");

      expect(summaryRepo.getSummaryByDocumentId(DOC_ID)).toBeDefined();
      expect(summaryRepo.getSummaryByDocumentId(DOC_ID)?.overview).toBe(
        "Test overview",
      );

      expect(fakeQueue.add).toHaveBeenCalledWith(
        "enrich-document",
        expect.objectContaining({
          documentId: DOC_ID,
          topicArea: "Test Topic",
        }),
        { jobId: `${DOC_ID}-enrich` },
      );

      expect(job.progressUpdates).toEqual([
        { stage: "parsing" },
        { stage: "analyzing" },
        { stage: "summarized" },
      ]);
    });

    it("should use vision extractor for image mime types", async () => {
      visionExtractor.setText("Text from image");
      fileStorage.seed("uploads/img.png", Buffer.from("fake-image"));

      const job = new FakeJob<ProcessDocumentJobData>(
        "job-2",
        {
          documentId: DOC_ID,
          storagePath: "uploads/img.png",
          filename: "photo.png",
          mimeType: "image/png",
        },
        "process-document",
      );

      await service.process(job as unknown as Job);

      expect(summaryRepo.getSummaryByDocumentId(DOC_ID)).toBeDefined();
    });

    it("should guess mime type from filename when not provided", async () => {
      fileStorage.seed("uploads/doc.txt", Buffer.from("Some content"));

      const job = new FakeJob<ProcessDocumentJobData>(
        "job-3",
        {
          documentId: DOC_ID,
          storagePath: "uploads/doc.txt",
          filename: "notes.txt",
        },
        "process-document",
      );

      await service.process(job as unknown as Job);

      expect(summaryRepo.getSummaryByDocumentId(DOC_ID)).toBeDefined();
    });

    it("should throw and mark FAILED when no text can be extracted", async () => {
      fileStorage.seed("uploads/empty.txt", Buffer.from(""));

      const job = new FakeJob<ProcessDocumentJobData>(
        "job-4",
        {
          documentId: DOC_ID,
          storagePath: "uploads/empty.txt",
          filename: "empty.txt",
          mimeType: "text/plain",
        },
        "process-document",
      );

      await expect(service.process(job as unknown as Job)).rejects.toThrow(
        "No text could be extracted from the document",
      );

      expect(documentRepo.getDocument(DOC_ID)?.status).toBe("FAILED");
    });

    it("should mark FAILED and re-throw on AI analysis error", async () => {
      fileStorage.seed("uploads/bad.txt", Buffer.from("content"));
      Object.defineProperty(documentAnalysis, "analyzeDocument", {
        value: () => Promise.reject(new Error("AI service down")),
        configurable: true,
      });

      const job = new FakeJob<ProcessDocumentJobData>(
        "job-5",
        {
          documentId: DOC_ID,
          storagePath: "uploads/bad.txt",
          filename: "bad.txt",
          mimeType: "text/plain",
        },
        "process-document",
      );

      await expect(service.process(job as unknown as Job)).rejects.toThrow(
        "AI service down",
      );

      const doc = documentRepo.getDocument(DOC_ID);
      expect(doc?.status).toBe("FAILED");
      expect(doc?.errorMessage).toBe("AI service down");
      expect(logger.hasLevel("error")).toBe(true);
    });
  });

  // ─── Job 2: enrich-document ────────────────────────────────────────────────

  describe("Job 2 (enrich-document) — concepts + quiz + finalize", () => {
    beforeEach(() => {
      // Seed a summary so finalize() can find it for conceptCount
      summaryRepo.seedSummary(DOC_ID);
      contentAnalysis.setResults([
        { name: "Concept A", description: "Desc A", relationships: [] },
        {
          name: "Concept B",
          description: "Desc B",
          relationships: [{ targetName: "Concept A", type: "DEPENDS_ON" }],
        },
      ]);
      quizGeneration.setResults([
        {
          type: "MULTIPLE_CHOICE" as never,
          text: "Q1?",
          options: [],
          difficulty: "intermediate",
        },
      ]);
    });

    it("should save concepts, quiz, and mark document COMPLETED", async () => {
      const job = new FakeJob<EnrichDocumentJobData>(
        "job-e1",
        { documentId: DOC_ID, text: SAMPLE_TEXT, topicArea: "Test Topic" },
        "enrich-document",
      );

      await service.process(job as unknown as Job);

      const doc = documentRepo.getDocument(DOC_ID);
      expect(doc?.status).toBe("COMPLETED");
      expect(doc?.processingStage).toBe("READY");

      expect(conceptRepository.getSavedConcepts()).toHaveLength(2);
      const quiz = quizRepo.getQuizByDocumentId(DOC_ID);
      expect(quiz).toBeDefined();
      expect(quiz?.questionCount).toBe(1);

      expect(job.progressUpdates).toEqual([
        { stage: "enriching" },
        { stage: "ready" },
      ]);
    });

    it("should continue when concept extraction fails but quiz succeeds", async () => {
      contentAnalysis.setShouldFail(true);

      const job = new FakeJob<EnrichDocumentJobData>(
        "job-e2",
        { documentId: DOC_ID, text: SAMPLE_TEXT, topicArea: "Test Topic" },
        "enrich-document",
      );

      await service.process(job as unknown as Job);

      expect(documentRepo.getDocument(DOC_ID)?.status).toBe("COMPLETED");
      expect(logger.hasLevel("warn")).toBe(true);
      expect(quizRepo.getQuizByDocumentId(DOC_ID)).toBeDefined();
    });

    it("should continue when quiz generation fails but concepts succeed", async () => {
      quizGeneration.setShouldFail(true);

      const job = new FakeJob<EnrichDocumentJobData>(
        "job-e3",
        { documentId: DOC_ID, text: SAMPLE_TEXT, topicArea: "Test Topic" },
        "enrich-document",
      );

      await service.process(job as unknown as Job);

      expect(documentRepo.getDocument(DOC_ID)?.status).toBe("COMPLETED");
      expect(logger.hasLevel("warn")).toBe(true);
      expect(conceptRepository.getSavedConcepts()).toHaveLength(2);
    });

    it("should still mark COMPLETED when both concepts and quiz fail (graceful degradation)", async () => {
      contentAnalysis.setShouldFail(true);
      quizGeneration.setShouldFail(true);

      const job = new FakeJob<EnrichDocumentJobData>(
        "job-e4",
        { documentId: DOC_ID, text: SAMPLE_TEXT, topicArea: "Test Topic" },
        "enrich-document",
      );

      // Enrichment error is caught and document is still marked COMPLETED
      await service.process(job as unknown as Job);

      expect(documentRepo.getDocument(DOC_ID)?.status).toBe("COMPLETED");
      expect(documentRepo.getDocument(DOC_ID)?.processingStage).toBe("READY");
      expect(logger.hasLevel("error")).toBe(true);
    });
  });

  // ─── Concept relationship mapping ──────────────────────────────────────────

  describe("concept relationship mapping", () => {
    beforeEach(() => {
      summaryRepo.seedSummary(DOC_ID);
    });

    it("should map relationships between extracted concepts", async () => {
      contentAnalysis.setResults([
        {
          name: "Alpha",
          description: "D1",
          relationships: [{ targetName: "Beta", type: "RELATED_TO" }],
        },
        { name: "Beta", description: "D2", relationships: [] },
        {
          name: "Gamma",
          description: "D3",
          relationships: [{ targetName: "Unknown", type: "DEPENDS_ON" }],
        },
      ]);

      const job = new FakeJob<EnrichDocumentJobData>(
        "job-r1",
        { documentId: DOC_ID, text: SAMPLE_TEXT, topicArea: "Test Topic" },
        "enrich-document",
      );

      await service.process(job as unknown as Job);

      const relations = conceptRepository.getSavedRelations();
      expect(relations).toHaveLength(1);
      expect(relations[0].type).toBe("RELATED_TO");
    });

    it("should update concept count on document summary", async () => {
      contentAnalysis.setResults([
        { name: "C1", description: "D1", relationships: [] },
        { name: "C2", description: "D2", relationships: [] },
        { name: "C3", description: "D3", relationships: [] },
      ]);

      const job = new FakeJob<EnrichDocumentJobData>(
        "job-r2",
        { documentId: DOC_ID, text: SAMPLE_TEXT, topicArea: "Test Topic" },
        "enrich-document",
      );

      await service.process(job as unknown as Job);

      expect(summaryRepo.getSummaryByDocumentId(DOC_ID)?.conceptCount).toBe(3);
    });
  });
});
