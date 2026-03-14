import { DocumentProcessorService } from "../../../src/document-processor/document-processor.service";
import { FakeLogger } from "../_fakes/logger.fake";
import { FakeJob } from "../_fakes/job.fake";
import { FakePrismaClient } from "../_fakes/prisma.fake";
import {
  FakeFileStorage,
  FakeContentAnalysisService,
  FakeDocumentAnalysisService,
  FakeQuizGenerationService,
  FakeImageTextExtractionService,
  FakeConceptRepository,
} from "../_fakes/services.fake";
import type { Job } from "bullmq";

interface JobData {
  documentId: string;
  storagePath: string;
  filename: string;
  mimeType?: string;
}

const DOC_ID = "doc-001";
const STORAGE_PATH = "uploads/doc-001.pdf";
const FILENAME = "test-document.pdf";

function buildService(overrides: {
  logger?: FakeLogger;
  contentAnalysis?: FakeContentAnalysisService;
  documentAnalysis?: FakeDocumentAnalysisService;
  quizGeneration?: FakeQuizGenerationService;
  visionExtractor?: FakeImageTextExtractionService;
  fileStorage?: FakeFileStorage;
  conceptRepository?: FakeConceptRepository;
  prisma?: FakePrismaClient;
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
  const prisma = overrides.prisma ?? new FakePrismaClient();

  // Create instance bypassing the decorator-based constructor
  const service = Object.create(
    DocumentProcessorService.prototype,
  ) as DocumentProcessorService;
  Object.defineProperty(service, "logger", { value: logger });
  Object.defineProperty(service, "contentAnalysis", { value: contentAnalysis });
  Object.defineProperty(service, "documentAnalysis", {
    value: documentAnalysis,
  });
  Object.defineProperty(service, "quizGeneration", { value: quizGeneration });
  Object.defineProperty(service, "visionExtractor", { value: visionExtractor });
  Object.defineProperty(service, "fileStorage", { value: fileStorage });
  Object.defineProperty(service, "conceptRepository", {
    value: conceptRepository,
  });
  Object.defineProperty(service, "prisma", { value: prisma });
  Object.defineProperty(service, "parser", {
    value: { supports: () => false, parse: () => ({ text: "" }) },
  });

  return {
    service,
    logger,
    contentAnalysis,
    documentAnalysis,
    quizGeneration,
    visionExtractor,
    fileStorage,
    conceptRepository,
    prisma,
  };
}

describe("DocumentProcessorService", () => {
  let service: DocumentProcessorService;
  let logger: FakeLogger;
  let contentAnalysis: FakeContentAnalysisService;
  let documentAnalysis: FakeDocumentAnalysisService;
  let quizGeneration: FakeQuizGenerationService;
  let visionExtractor: FakeImageTextExtractionService;
  let fileStorage: FakeFileStorage;
  let conceptRepository: FakeConceptRepository;
  let prisma: FakePrismaClient;

  beforeEach(() => {
    const ctx = buildService({});
    service = ctx.service;
    logger = ctx.logger;
    contentAnalysis = ctx.contentAnalysis;
    documentAnalysis = ctx.documentAnalysis;
    quizGeneration = ctx.quizGeneration;
    visionExtractor = ctx.visionExtractor;
    fileStorage = ctx.fileStorage;
    conceptRepository = ctx.conceptRepository;
    prisma = ctx.prisma;

    // Seed file storage with a PDF buffer
    fileStorage.seed(STORAGE_PATH, Buffer.from("Hello World document content"));
    prisma.seedDocument(DOC_ID);
  });

  describe("happy path — full processing pipeline", () => {
    beforeEach(() => {
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

    it("should process a text-based document end-to-end", async () => {
      const job = new FakeJob<JobData>("job-1", {
        documentId: DOC_ID,
        storagePath: STORAGE_PATH,
        filename: FILENAME,
        mimeType: "text/plain",
      });

      await service.process(job as unknown as Job<JobData>);

      // Document should be COMPLETED
      const doc = prisma.getDocument(DOC_ID);
      expect(doc?.status).toBe("COMPLETED");
      expect(doc?.processingStage).toBe("READY");

      // Summary should be saved
      const summary = prisma.getSummaryByDocumentId(DOC_ID);
      expect(summary).toBeDefined();
      expect(summary?.overview).toBe("Test overview");
      expect(summary?.topicArea).toBe("Test Topic");

      // Quiz should be saved
      const quiz = prisma.getQuizByDocumentId(DOC_ID);
      expect(quiz).toBeDefined();
      expect(quiz?.questionCount).toBe(1);

      // Questions should be saved
      const questions = prisma.getQuestionsByQuizId(quiz?.id as string);
      expect(questions).toHaveLength(1);

      // Concepts should be saved to Neo4j
      const concepts = conceptRepository.getSavedConcepts();
      expect(concepts).toHaveLength(2);

      // Relationships should be saved
      const relations = conceptRepository.getSavedRelations();
      expect(relations).toHaveLength(1);
      expect(relations[0].type).toBe("DEPENDS_ON");

      // Progress should track all stages
      expect(job.progressUpdates).toEqual([
        { stage: "parsing" },
        { stage: "analyzing" },
        { stage: "summarized" },
        { stage: "ready" },
      ]);
    });
  });

  describe("text extraction", () => {
    it("should use vision extractor for image mime types", async () => {
      visionExtractor.setText("Text from image");
      fileStorage.seed("uploads/img.png", Buffer.from("fake-image"));

      const job = new FakeJob<JobData>("job-2", {
        documentId: DOC_ID,
        storagePath: "uploads/img.png",
        filename: "photo.png",
        mimeType: "image/png",
      });

      await service.process(job as unknown as Job<JobData>);

      const summary = prisma.getSummaryByDocumentId(DOC_ID);
      expect(summary).toBeDefined();
    });

    it("should decode plain text files directly from buffer", async () => {
      const textContent = "Direct text content from file";
      fileStorage.seed("uploads/readme.txt", Buffer.from(textContent));

      const job = new FakeJob<JobData>("job-3", {
        documentId: DOC_ID,
        storagePath: "uploads/readme.txt",
        filename: "readme.txt",
        mimeType: "text/plain",
      });

      await service.process(job as unknown as Job<JobData>);

      const doc = prisma.getDocument(DOC_ID);
      expect(doc?.status).toBe("COMPLETED");
    });

    it("should guess mime type from filename extension when not provided", async () => {
      fileStorage.seed("uploads/doc.txt", Buffer.from("Some content"));

      const job = new FakeJob<JobData>("job-4", {
        documentId: DOC_ID,
        storagePath: "uploads/doc.txt",
        filename: "notes.txt",
      });

      await service.process(job as unknown as Job<JobData>);

      const doc = prisma.getDocument(DOC_ID);
      expect(doc?.status).toBe("COMPLETED");
    });

    it("should throw when no text can be extracted", async () => {
      fileStorage.seed("uploads/empty.txt", Buffer.from(""));

      const job = new FakeJob<JobData>("job-5", {
        documentId: DOC_ID,
        storagePath: "uploads/empty.txt",
        filename: "empty.txt",
        mimeType: "text/plain",
      });

      await expect(
        service.process(job as unknown as Job<JobData>),
      ).rejects.toThrow("No text could be extracted from the document");

      const doc = prisma.getDocument(DOC_ID);
      expect(doc?.status).toBe("FAILED");
    });
  });

  describe("partial failure handling", () => {
    it("should continue when concept extraction fails but quiz succeeds", async () => {
      contentAnalysis.setShouldFail(true);
      quizGeneration.setResults([
        {
          type: "MULTIPLE_CHOICE" as never,
          text: "Q1?",
          options: [],
          difficulty: "easy",
        },
      ]);

      const job = new FakeJob<JobData>("job-6", {
        documentId: DOC_ID,
        storagePath: STORAGE_PATH,
        filename: FILENAME,
        mimeType: "text/plain",
      });

      await service.process(job as unknown as Job<JobData>);

      const doc = prisma.getDocument(DOC_ID);
      expect(doc?.status).toBe("COMPLETED");
      expect(logger.hasLevel("warn")).toBe(true);

      // Quiz should still be saved
      const quiz = prisma.getQuizByDocumentId(DOC_ID);
      expect(quiz).toBeDefined();
    });

    it("should continue when quiz generation fails but concepts succeed", async () => {
      contentAnalysis.setResults([
        { name: "Concept X", description: "Desc X", relationships: [] },
      ]);
      quizGeneration.setShouldFail(true);

      const job = new FakeJob<JobData>("job-7", {
        documentId: DOC_ID,
        storagePath: STORAGE_PATH,
        filename: FILENAME,
        mimeType: "text/plain",
      });

      await service.process(job as unknown as Job<JobData>);

      const doc = prisma.getDocument(DOC_ID);
      expect(doc?.status).toBe("COMPLETED");
      expect(logger.hasLevel("warn")).toBe(true);

      // Concepts should still be saved
      expect(conceptRepository.getSavedConcepts()).toHaveLength(1);
    });

    it("should fail when both concept extraction and quiz generation fail", async () => {
      contentAnalysis.setShouldFail(true);
      quizGeneration.setShouldFail(true);

      const job = new FakeJob<JobData>("job-8", {
        documentId: DOC_ID,
        storagePath: STORAGE_PATH,
        filename: FILENAME,
        mimeType: "text/plain",
      });

      await expect(
        service.process(job as unknown as Job<JobData>),
      ).rejects.toThrow("Both concept extraction and quiz generation failed");

      const doc = prisma.getDocument(DOC_ID);
      expect(doc?.status).toBe("FAILED");
    });
  });

  describe("error handling", () => {
    it("should mark document as FAILED and re-throw on unexpected error", async () => {
      fileStorage.seed("uploads/bad.txt", Buffer.from("content"));

      // Make document analysis throw
      Object.defineProperty(documentAnalysis, "analyzeDocument", {
        value: () => Promise.reject(new Error("AI service down")),
      });

      const job = new FakeJob<JobData>("job-9", {
        documentId: DOC_ID,
        storagePath: "uploads/bad.txt",
        filename: "bad.txt",
        mimeType: "text/plain",
      });

      await expect(
        service.process(job as unknown as Job<JobData>),
      ).rejects.toThrow("AI service down");

      const doc = prisma.getDocument(DOC_ID);
      expect(doc?.status).toBe("FAILED");
      expect(doc?.errorMessage).toBe("AI service down");
      expect(logger.hasLevel("error")).toBe(true);
    });
  });

  describe("concept relationship mapping", () => {
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

      const job = new FakeJob<JobData>("job-10", {
        documentId: DOC_ID,
        storagePath: STORAGE_PATH,
        filename: FILENAME,
        mimeType: "text/plain",
      });

      await service.process(job as unknown as Job<JobData>);

      const relations = conceptRepository.getSavedRelations();
      // Only Alpha→Beta should exist. Gamma→Unknown should be skipped (no matching concept)
      expect(relations).toHaveLength(1);
      expect(relations[0].type).toBe("RELATED_TO");
    });

    it("should update concept count on document summary", async () => {
      contentAnalysis.setResults([
        { name: "C1", description: "D1", relationships: [] },
        { name: "C2", description: "D2", relationships: [] },
        { name: "C3", description: "D3", relationships: [] },
      ]);

      const job = new FakeJob<JobData>("job-11", {
        documentId: DOC_ID,
        storagePath: STORAGE_PATH,
        filename: FILENAME,
        mimeType: "text/plain",
      });

      await service.process(job as unknown as Job<JobData>);

      const summary = prisma.getSummaryByDocumentId(DOC_ID);
      expect(summary?.conceptCount).toBe(3);
    });
  });
});
