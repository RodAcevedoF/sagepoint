import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Inject } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";
import { Job, Queue } from "bullmq";
import { CompositeDocumentParser } from "@sagepoint/parsing";
import {
  DocumentStatus,
  ProcessingStage,
  DocumentSummary,
  Quiz,
  Question,
  Concept,
  CONTENT_ANALYSIS_SERVICE,
  DOCUMENT_ANALYSIS_SERVICE,
  QUIZ_GENERATION_SERVICE,
  IMAGE_TEXT_EXTRACTION_SERVICE,
  FILE_STORAGE,
  CONCEPT_REPOSITORY,
  DOCUMENT_REPOSITORY,
  DOCUMENT_SUMMARY_REPOSITORY,
  QUIZ_REPOSITORY,
  QUESTION_REPOSITORY,
  TOKEN_BALANCE_REPOSITORY,
  OPERATION_COSTS,
} from "@sagepoint/domain";
import type {
  IFileStorage,
  IConceptRepository,
  IDocumentRepository,
  IDocumentSummaryRepository,
  IQuizRepository,
  IQuestionRepository,
  ITokenBalanceRepository,
  IContentAnalysisService,
  IDocumentAnalysisService,
  IQuizGenerationService,
  IImageTextExtractionService,
  DocumentProcessingProgress,
  ExtractedConcept,
  DocumentAnalysisResult,
  GeneratedQuestion,
} from "@sagepoint/domain";
import { randomUUID } from "crypto";

// ─── Job data shapes ──────────────────────────────────────────────────────────

interface ProcessDocumentData {
  documentId: string;
  storagePath: string;
  filename: string;
  mimeType?: string;
  userId?: string;
}

interface EnrichDocumentData {
  documentId: string;
  text: string;
  topicArea: string;
  userId?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_AI_TEXT_LENGTH = 15_000;

const MIME_MAP: Record<string, string> = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  txt: "text/plain",
  md: "text/markdown",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
};

type OnProgress = (p: DocumentProcessingProgress) => void;

// ─── Processor ────────────────────────────────────────────────────────────────

@Processor("document-processing")
export class DocumentProcessorService extends WorkerHost {
  private readonly parser = new CompositeDocumentParser();

  constructor(
    @InjectPinoLogger(DocumentProcessorService.name)
    private readonly logger: PinoLogger,
    @InjectQueue("document-processing")
    private readonly queue: Queue,
    @Inject(CONTENT_ANALYSIS_SERVICE)
    private readonly contentAnalysis: IContentAnalysisService,
    @Inject(DOCUMENT_ANALYSIS_SERVICE)
    private readonly documentAnalysis: IDocumentAnalysisService,
    @Inject(QUIZ_GENERATION_SERVICE)
    private readonly quizGeneration: IQuizGenerationService,
    @Inject(IMAGE_TEXT_EXTRACTION_SERVICE)
    private readonly visionExtractor: IImageTextExtractionService,
    @Inject(FILE_STORAGE)
    private readonly fileStorage: IFileStorage,
    @Inject(CONCEPT_REPOSITORY)
    private readonly conceptRepository: IConceptRepository,
    @Inject(DOCUMENT_REPOSITORY)
    private readonly documentRepo: IDocumentRepository,
    @Inject(DOCUMENT_SUMMARY_REPOSITORY)
    private readonly documentSummaryRepo: IDocumentSummaryRepository,
    @Inject(QUIZ_REPOSITORY)
    private readonly quizRepo: IQuizRepository,
    @Inject(QUESTION_REPOSITORY)
    private readonly questionRepo: IQuestionRepository,
    @Inject(TOKEN_BALANCE_REPOSITORY)
    private readonly tokenBalanceRepo: ITokenBalanceRepository,
  ) {
    super();
  }

  // ─── BullMQ entry point ───────────────────────────────────────────────────

  async process(job: Job): Promise<void> {
    const onProgress: OnProgress = (p) => void job.updateProgress(p);

    if (job.name === "enrich-document") {
      await this.runEnrichment(job.data as EnrichDocumentData, onProgress);
    } else {
      await this.runProcessing(job.data as ProcessDocumentData, onProgress);
    }
  }

  // ─── Job 1: parse + analyze ───────────────────────────────────────────────

  private async runProcessing(
    {
      documentId,
      storagePath,
      filename,
      mimeType,
      userId,
    }: ProcessDocumentData,
    onProgress: OnProgress,
  ): Promise<void> {
    this.logger.info({ documentId }, "Starting document processing");

    try {
      const text = await this.parseDocument(
        documentId,
        storagePath,
        filename,
        mimeType,
        onProgress,
      );
      const analysis = await this.analyzeDocument(documentId, text, onProgress);

      await this.queue.add(
        "enrich-document",
        {
          documentId,
          text: text.substring(0, MAX_AI_TEXT_LENGTH),
          topicArea: analysis.topicArea,
          userId,
        },
        { jobId: `${documentId}-enrich` },
      );
    } catch (error) {
      await this.markFailed(documentId, error);
      throw error;
    }
  }

  // ─── Job 2: concepts + quiz + finalize ────────────────────────────────────

  private async runEnrichment(
    { documentId, text, topicArea, userId }: EnrichDocumentData,
    onProgress: OnProgress,
  ): Promise<void> {
    this.logger.info({ documentId }, "Starting document enrichment");

    try {
      await this.updateStage(documentId, undefined, ProcessingStage.ENRICHING);
      onProgress({ stage: "enriching" });

      await this.extractConceptsAndQuiz(documentId, text, topicArea);
      await this.finalize(documentId, userId, onProgress);
    } catch (error) {
      // Summary is already saved — degrade gracefully instead of failing
      this.logger.error(
        {
          documentId,
          err: error instanceof Error ? error.message : String(error),
        },
        "Enrichment failed, finalizing without quiz/concepts",
      );
      await this.documentRepo.updateStatus(documentId, {
        status: DocumentStatus.COMPLETED,
        processingStage: ProcessingStage.READY,
      });
      onProgress({ stage: "ready" });
    }
  }

  // ─── Processing steps ─────────────────────────────────────────────────────

  private async parseDocument(
    documentId: string,
    storagePath: string,
    filename: string,
    mimeType?: string,
    onProgress?: OnProgress,
  ): Promise<string> {
    await this.updateStage(
      documentId,
      DocumentStatus.PROCESSING,
      ProcessingStage.PARSING,
    );
    onProgress?.({ stage: "parsing" });

    const buffer = await this.fileStorage.download(storagePath);
    const resolvedMime = mimeType ?? this.guessMimeType(filename);
    const text = await this.extractText(buffer, resolvedMime);

    if (!text?.trim()) {
      throw new Error("No text could be extracted from the document");
    }

    this.logger.info({ documentId, charCount: text.length }, "Text extracted");
    return text;
  }

  private async analyzeDocument(
    documentId: string,
    text: string,
    onProgress?: OnProgress,
  ): Promise<DocumentAnalysisResult> {
    await this.updateStage(documentId, undefined, ProcessingStage.ANALYZING);
    onProgress?.({ stage: "analyzing" });

    const analysis = await this.documentAnalysis.analyzeDocument(
      text.substring(0, MAX_AI_TEXT_LENGTH),
    );

    await this.saveSummary(documentId, analysis);
    await this.updateStage(documentId, undefined, ProcessingStage.SUMMARIZED);
    onProgress?.({ stage: "summarized" });

    this.logger.info({ documentId }, "Summary saved");
    return analysis;
  }

  private async extractConceptsAndQuiz(
    documentId: string,
    text: string,
    topicArea: string,
  ): Promise<void> {
    const [conceptsResult, quizResult] = await Promise.allSettled([
      this.contentAnalysis.extractConcepts(text),
      this.quizGeneration.generateQuiz(text, [], { questionCount: 10 }),
    ]);

    if (conceptsResult.status === "fulfilled") {
      await this.saveConcepts(documentId, conceptsResult.value);
    } else {
      this.logger.warn(
        { documentId, err: String(conceptsResult.reason) },
        "Concept extraction failed",
      );
    }

    if (quizResult.status === "fulfilled") {
      await this.saveQuiz(documentId, topicArea, quizResult.value);
    } else {
      this.logger.warn(
        { documentId, err: String(quizResult.reason) },
        "Quiz generation failed",
      );
    }

    if (
      conceptsResult.status === "rejected" &&
      quizResult.status === "rejected"
    ) {
      throw new Error("Both concept extraction and quiz generation failed");
    }
  }

  private async finalize(
    documentId: string,
    userId: string | undefined,
    onProgress: OnProgress,
  ): Promise<void> {
    const summary = await this.documentSummaryRepo.findByDocumentId(documentId);
    await this.documentRepo.updateStatus(documentId, {
      status: DocumentStatus.COMPLETED,
      processingStage: ProcessingStage.READY,
      conceptCount: summary?.conceptCount ?? 0,
    });
    onProgress({ stage: "ready" });

    if (userId) {
      const deducted = await this.tokenBalanceRepo.atomicDeduct(
        userId,
        OPERATION_COSTS.DOCUMENT_UPLOAD,
      );
      if (!deducted) {
        this.logger.warn(
          { documentId, userId },
          "Token deduction failed after document processing (race condition — overage accepted)",
        );
      }
    }

    this.logger.info({ documentId }, "Document fully processed");
  }

  // ─── Persistence helpers ──────────────────────────────────────────────────

  private async saveSummary(
    documentId: string,
    analysis: DocumentAnalysisResult,
  ): Promise<void> {
    await this.documentSummaryRepo.save(
      new DocumentSummary(
        randomUUID(),
        documentId,
        analysis.overview,
        analysis.keyPoints,
        analysis.topicArea,
        analysis.difficulty,
        0,
        new Date(),
      ),
    );
  }

  private async saveQuiz(
    documentId: string,
    topicArea: string,
    questions: GeneratedQuestion[],
  ): Promise<void> {
    const quizId = randomUUID();
    const now = new Date();

    await this.quizRepo.save(
      new Quiz(
        quizId,
        documentId,
        `${topicArea} Quiz`,
        questions.length,
        now,
        now,
      ),
    );

    if (questions.length > 0) {
      await this.questionRepo.saveMany(
        questions.map(
          (q, index) =>
            new Question(
              randomUUID(),
              quizId,
              q.type,
              q.text,
              q.options,
              index,
              q.difficulty,
              now,
              q.explanation ?? undefined,
            ),
        ),
      );
    }
  }

  private async saveConcepts(
    documentId: string,
    extracted: ExtractedConcept[],
  ): Promise<void> {
    const concepts = extracted.map((e) =>
      Concept.create(randomUUID(), e.name, documentId, e.description),
    );

    const relationships = extracted.flatMap((source) => {
      const sourceConcept = concepts.find(
        (c) => c.name.toLowerCase() === source.name.toLowerCase().trim(),
      );
      if (!sourceConcept || !source.relationships?.length) return [];

      return source.relationships.flatMap((rel) => {
        const target = concepts.find(
          (c) => c.name.toLowerCase() === rel.targetName.toLowerCase().trim(),
        );
        return target
          ? [{ fromId: sourceConcept.id, toId: target.id, type: rel.type }]
          : [];
      });
    });

    await this.conceptRepository.saveWithRelations(
      concepts,
      relationships,
      documentId,
      "Document",
    );

    const summary = await this.documentSummaryRepo.findByDocumentId(documentId);
    if (summary) {
      await this.documentSummaryRepo.save(
        new DocumentSummary(
          summary.id,
          summary.documentId,
          summary.overview,
          summary.keyPoints,
          summary.topicArea,
          summary.difficulty,
          concepts.length,
          summary.createdAt,
          summary.estimatedReadTime,
        ),
      );
    }

    this.logger.info(
      {
        documentId,
        conceptCount: concepts.length,
        relationshipCount: relationships.length,
      },
      "Saved concepts to Neo4j",
    );
  }

  // ─── Low-level utilities ──────────────────────────────────────────────────

  private async updateStage(
    documentId: string,
    status?: DocumentStatus,
    processingStage?: ProcessingStage,
  ): Promise<void> {
    await this.documentRepo.updateStatus(documentId, {
      ...(status !== undefined && { status }),
      ...(processingStage !== undefined && { processingStage }),
    });
  }

  private async markFailed(documentId: string, error: unknown): Promise<void> {
    this.logger.error({ documentId, err: error }, "Document processing failed");
    await this.documentRepo.updateStatus(documentId, {
      status: DocumentStatus.FAILED,
      errorMessage: error instanceof Error ? error.message : "Unknown error",
    });
  }

  private async extractText(buffer: Buffer, mimeType: string): Promise<string> {
    if (mimeType.startsWith("image/")) {
      return this.visionExtractor.extractText(buffer, mimeType);
    }
    if (mimeType.startsWith("text/")) {
      return buffer.toString("utf-8");
    }
    if (this.parser.supports(mimeType)) {
      return (await this.parser.parse(buffer, mimeType)).text;
    }
    this.logger.warn({ mimeType }, "Unknown MIME type, attempting text decode");
    return buffer.toString("utf-8");
  }

  private guessMimeType(filename: string): string {
    const ext = filename.toLowerCase().split(".").pop() ?? "";
    return MIME_MAP[ext] ?? "application/octet-stream";
  }
}
