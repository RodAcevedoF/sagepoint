import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Inject } from "@nestjs/common";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";
import { Job } from "bullmq";
import {
  PrismaClient,
  PrismaPg,
  Prisma,
  ProcessingStage,
} from "@sagepoint/database";
import { CompositeDocumentParser } from "@sagepoint/parsing";
import {
  DocumentStatus,
  Concept,
  CONTENT_ANALYSIS_SERVICE,
  DOCUMENT_ANALYSIS_SERVICE,
  QUIZ_GENERATION_SERVICE,
  IMAGE_TEXT_EXTRACTION_SERVICE,
  FILE_STORAGE,
  CONCEPT_REPOSITORY,
} from "@sagepoint/domain";
import type {
  IFileStorage,
  IConceptRepository,
  IContentAnalysisService,
  IDocumentAnalysisService,
  IQuizGenerationService,
  IImageTextExtractionService,
  ExtractedConcept,
  DocumentAnalysisResult,
  GeneratedQuestion,
} from "@sagepoint/domain";
import { randomUUID } from "crypto";

interface JobData {
  documentId: string;
  storagePath: string;
  filename: string;
  mimeType?: string;
}

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

const MAX_AI_TEXT_LENGTH = 15000;

@Processor("document-processing")
export class DocumentProcessorService extends WorkerHost {
  private readonly prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
  });
  private readonly parser = new CompositeDocumentParser();

  constructor(
    @InjectPinoLogger(DocumentProcessorService.name)
    private readonly logger: PinoLogger,
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
  ) {
    super();
  }

  async process(job: Job<JobData>) {
    const { documentId, storagePath, filename, mimeType } = job.data;
    this.logger.info(
      { jobId: job.id, documentId, filename, mimeType },
      "Processing document",
    );

    try {
      const text = await this.parseDocument(
        job,
        documentId,
        storagePath,
        filename,
        mimeType,
      );
      const analysis = await this.analyzeDocument(job, documentId, text);
      await this.extractConceptsAndQuiz(job, documentId, text, analysis);
      await this.finalize(job, documentId);
    } catch (error) {
      await this.handleFailure(job, documentId, error);
      throw error;
    }
  }

  private async parseDocument(
    job: Job<JobData>,
    documentId: string,
    storagePath: string,
    filename: string,
    mimeType?: string,
  ): Promise<string> {
    await this.updateStage(
      documentId,
      DocumentStatus.PROCESSING,
      ProcessingStage.PARSING,
    );
    await job.updateProgress({ stage: "parsing" });

    const buffer = await this.fileStorage.download(storagePath);
    const resolvedMime = mimeType || this.guessMimeType(filename);
    const text = await this.extractText(buffer, resolvedMime);

    if (!text || text.trim().length === 0) {
      throw new Error("No text could be extracted from the document");
    }

    this.logger.info(
      { jobId: job.id, documentId, charCount: text.length },
      "Text extracted",
    );
    return text;
  }

  private async analyzeDocument(
    job: Job<JobData>,
    documentId: string,
    text: string,
  ): Promise<DocumentAnalysisResult> {
    await this.updateStage(documentId, undefined, ProcessingStage.ANALYZING);
    await job.updateProgress({ stage: "analyzing" });

    const truncatedText = text.substring(0, MAX_AI_TEXT_LENGTH);
    const analysis = await this.documentAnalysis.analyzeDocument(truncatedText);

    await this.saveSummary(documentId, analysis);
    await this.updateStage(documentId, undefined, ProcessingStage.SUMMARIZED);
    await job.updateProgress({ stage: "summarized" });

    this.logger.info(
      { jobId: job.id, documentId, stage: "summarized" },
      "Summary saved",
    );
    return analysis;
  }

  private async extractConceptsAndQuiz(
    job: Job<JobData>,
    documentId: string,
    text: string,
    analysis: DocumentAnalysisResult,
  ): Promise<void> {
    const truncatedText = text.substring(0, MAX_AI_TEXT_LENGTH);

    const [conceptsResult, quizResult] = await Promise.allSettled([
      this.contentAnalysis.extractConcepts(truncatedText),
      this.quizGeneration.generateQuiz(truncatedText, [], {
        questionCount: 10,
      }),
    ]);

    let conceptCount = 0;

    if (conceptsResult.status === "fulfilled") {
      const concepts = conceptsResult.value.map((e) =>
        Concept.create(randomUUID(), e.name, documentId, e.description),
      );
      await this.saveConcepts(concepts, conceptsResult.value, documentId);
      conceptCount = concepts.length;
      await this.prisma.documentSummary.updateMany({
        where: { documentId },
        data: { conceptCount },
      });
    } else {
      this.logger.warn(
        { jobId: job.id, documentId, err: String(conceptsResult.reason) },
        "Concept extraction failed, continuing with partial results",
      );
    }

    if (quizResult.status === "fulfilled") {
      await this.saveQuiz(documentId, analysis.topicArea, quizResult.value);
    } else {
      this.logger.warn(
        { jobId: job.id, documentId, err: String(quizResult.reason) },
        "Quiz generation failed, continuing with partial results",
      );
    }

    if (
      conceptsResult.status === "rejected" &&
      quizResult.status === "rejected"
    ) {
      throw new Error("Both concept extraction and quiz generation failed");
    }
  }

  private async finalize(job: Job<JobData>, documentId: string): Promise<void> {
    const summary = await this.prisma.documentSummary.findFirst({
      where: { documentId },
    });
    await this.prisma.document.update({
      where: { id: documentId },
      data: {
        status: DocumentStatus.COMPLETED,
        processingStage: "READY",
        conceptCount: summary?.conceptCount ?? 0,
      },
    });
    await job.updateProgress({ stage: "ready" });
    this.logger.info(
      { jobId: job.id, documentId, stage: "ready" },
      "Document fully processed",
    );
  }

  private async handleFailure(
    job: Job<JobData>,
    documentId: string,
    error: unknown,
  ): Promise<void> {
    const err = error instanceof Error ? error : new Error(String(error));
    this.logger.error(
      { jobId: job.id, documentId, err },
      "Document processing failed",
    );
    await this.prisma.document.update({
      where: { id: documentId },
      data: {
        status: DocumentStatus.FAILED,
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      },
    });
  }

  private async updateStage(
    documentId: string,
    status?: DocumentStatus,
    processingStage?: ProcessingStage,
  ): Promise<void> {
    await this.prisma.document.update({
      where: { id: documentId },
      data: {
        ...(status && { status }),
        ...(processingStage && { processingStage }),
      },
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
      const result = await this.parser.parse(buffer, mimeType);
      return result.text;
    }

    this.logger.warn({ mimeType }, "Unknown MIME type, attempting text decode");
    return buffer.toString("utf-8");
  }

  private guessMimeType(filename: string): string {
    const ext = filename.toLowerCase().split(".").pop();
    return MIME_MAP[ext || ""] || "application/octet-stream";
  }

  private async saveSummary(
    documentId: string,
    analysis: DocumentAnalysisResult,
  ): Promise<void> {
    await this.prisma.documentSummary.create({
      data: {
        id: randomUUID(),
        documentId,
        overview: analysis.overview,
        keyPoints: analysis.keyPoints,
        topicArea: analysis.topicArea,
        difficulty: analysis.difficulty,
        conceptCount: 0,
      },
    });
  }

  private async saveQuiz(
    documentId: string,
    topicArea: string,
    questions: GeneratedQuestion[],
  ): Promise<void> {
    const quizId = randomUUID();
    await this.prisma.quiz.create({
      data: {
        id: quizId,
        documentId,
        title: `${topicArea} Quiz`,
        questionCount: questions.length,
      },
    });

    if (questions.length > 0) {
      await this.prisma.question.createMany({
        data: questions.map((q, index) => ({
          id: randomUUID(),
          quizId,
          type: q.type,
          text: q.text,
          options: q.options as unknown as Prisma.InputJsonValue,
          explanation: q.explanation,
          difficulty: q.difficulty,
          order: index,
        })),
      });
    }
  }

  private async saveConcepts(
    concepts: Concept[],
    extracted: ExtractedConcept[],
    documentId: string,
  ): Promise<void> {
    const relationships: { fromId: string; toId: string; type: string }[] = [];
    for (const source of extracted) {
      if (!source.relationships || source.relationships.length === 0) continue;
      const sourceConcept = concepts.find(
        (c) => c.name.toLowerCase() === source.name.toLowerCase().trim(),
      );
      if (!sourceConcept) continue;

      for (const rel of source.relationships) {
        const targetConcept = concepts.find(
          (c) => c.name.toLowerCase() === rel.targetName.toLowerCase().trim(),
        );
        if (targetConcept) {
          relationships.push({
            fromId: sourceConcept.id,
            toId: targetConcept.id,
            type: rel.type,
          });
        }
      }
    }

    await this.conceptRepository.saveWithRelations(
      concepts,
      relationships,
      documentId,
      "Document",
    );
    this.logger.info(
      {
        documentId,
        conceptCount: concepts.length,
        relationshipCount: relationships.length,
      },
      "Saved concepts to Neo4j",
    );
  }
}
