import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Inject } from "@nestjs/common";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";
import { Job } from "bullmq";
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
} from "@sagepoint/domain";
import type {
  IFileStorage,
  IConceptRepository,
  IDocumentRepository,
  IDocumentSummaryRepository,
  IQuizRepository,
  IQuestionRepository,
  IContentAnalysisService,
  IDocumentAnalysisService,
  IQuizGenerationService,
  IImageTextExtractionService,
  IDocumentProcessorService,
  DocumentProcessingInput,
  DocumentProcessingProgress,
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
export class DocumentProcessorService
  extends WorkerHost
  implements IDocumentProcessorService
{
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
    @Inject(DOCUMENT_REPOSITORY)
    private readonly documentRepo: IDocumentRepository,
    @Inject(DOCUMENT_SUMMARY_REPOSITORY)
    private readonly documentSummaryRepo: IDocumentSummaryRepository,
    @Inject(QUIZ_REPOSITORY)
    private readonly quizRepo: IQuizRepository,
    @Inject(QUESTION_REPOSITORY)
    private readonly questionRepo: IQuestionRepository,
  ) {
    super();
  }

  async process(job: Job<JobData>) {
    await this.processDocument(job.data, (progress) => {
      void job.updateProgress(progress);
    });
  }

  async processDocument(
    input: DocumentProcessingInput,
    onProgress?: (progress: DocumentProcessingProgress) => void,
  ): Promise<void> {
    const { documentId, storagePath, filename, mimeType } = input;
    this.logger.info({ documentId, filename, mimeType }, "Processing document");

    try {
      const text = await this.parseDocument(
        documentId,
        storagePath,
        filename,
        mimeType,
        onProgress,
      );
      const analysis = await this.analyzeDocument(documentId, text, onProgress);
      await this.extractConceptsAndQuiz(documentId, text, analysis);
      await this.finalize(documentId, onProgress);
    } catch (error) {
      await this.handleFailure(documentId, error);
      throw error;
    }
  }

  private async parseDocument(
    documentId: string,
    storagePath: string,
    filename: string,
    mimeType?: string,
    onProgress?: (progress: DocumentProcessingProgress) => void,
  ): Promise<string> {
    await this.updateStage(
      documentId,
      DocumentStatus.PROCESSING,
      ProcessingStage.PARSING,
    );
    onProgress?.({ stage: "parsing" });

    const buffer = await this.fileStorage.download(storagePath);
    const resolvedMime = mimeType || this.guessMimeType(filename);
    const text = await this.extractText(buffer, resolvedMime);

    if (!text || text.trim().length === 0) {
      throw new Error("No text could be extracted from the document");
    }

    this.logger.info({ documentId, charCount: text.length }, "Text extracted");
    return text;
  }

  private async analyzeDocument(
    documentId: string,
    text: string,
    onProgress?: (progress: DocumentProcessingProgress) => void,
  ): Promise<DocumentAnalysisResult> {
    await this.updateStage(documentId, undefined, ProcessingStage.ANALYZING);
    onProgress?.({ stage: "analyzing" });

    const truncatedText = text.substring(0, MAX_AI_TEXT_LENGTH);
    const analysis = await this.documentAnalysis.analyzeDocument(truncatedText);

    await this.saveSummary(documentId, analysis);
    await this.updateStage(documentId, undefined, ProcessingStage.SUMMARIZED);
    onProgress?.({ stage: "summarized" });

    this.logger.info({ documentId, stage: "summarized" }, "Summary saved");
    return analysis;
  }

  private async extractConceptsAndQuiz(
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
      const existingSummary =
        await this.documentSummaryRepo.findByDocumentId(documentId);
      if (existingSummary) {
        await this.documentSummaryRepo.save(
          new DocumentSummary(
            existingSummary.id,
            existingSummary.documentId,
            existingSummary.overview,
            existingSummary.keyPoints,
            existingSummary.topicArea,
            existingSummary.difficulty,
            conceptCount,
            existingSummary.createdAt,
            existingSummary.estimatedReadTime,
          ),
        );
      }
    } else {
      this.logger.warn(
        { documentId, err: String(conceptsResult.reason) },
        "Concept extraction failed, continuing with partial results",
      );
    }

    if (quizResult.status === "fulfilled") {
      await this.saveQuiz(documentId, analysis.topicArea, quizResult.value);
    } else {
      this.logger.warn(
        { documentId, err: String(quizResult.reason) },
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

  private async finalize(
    documentId: string,
    onProgress?: (progress: DocumentProcessingProgress) => void,
  ): Promise<void> {
    const summary = await this.documentSummaryRepo.findByDocumentId(documentId);
    await this.documentRepo.updateStatus(documentId, {
      status: DocumentStatus.COMPLETED,
      processingStage: ProcessingStage.READY,
      conceptCount: summary?.conceptCount ?? 0,
    });
    onProgress?.({ stage: "ready" });
    this.logger.info(
      { documentId, stage: "ready" },
      "Document fully processed",
    );
  }

  private async handleFailure(
    documentId: string,
    error: unknown,
  ): Promise<void> {
    const err = error instanceof Error ? error : new Error(String(error));
    this.logger.error({ documentId, err }, "Document processing failed");
    await this.documentRepo.updateStatus(documentId, {
      status: DocumentStatus.FAILED,
      errorMessage: error instanceof Error ? error.message : "Unknown error",
    });
  }

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
