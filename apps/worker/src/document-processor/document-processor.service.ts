import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { Job } from 'bullmq';
import { PrismaClient, Prisma } from '@sagepoint/database';
import { CompositeDocumentParser } from '@sagepoint/parsing';
import { DocumentStatus, Concept, QuestionType } from '@sagepoint/domain';
import type { IFileStorage, ExtractedConcept } from '@sagepoint/domain';
import {
  OpenAiContentAnalysisAdapter,
  OpenAiDocumentAnalysisAdapter,
  OpenAiQuizGenerationAdapter,
  OpenAiVisionTextExtractorAdapter,
} from '@sagepoint/ai';
import { Neo4jService } from '@sagepoint/graph';
import { randomUUID } from 'crypto';

interface JobData {
  documentId: string;
  storagePath: string;
  filename: string;
  mimeType?: string;
}

@Processor('document-processing')
export class DocumentProcessorService extends WorkerHost {
  private readonly prisma = new PrismaClient();
  private readonly parser = new CompositeDocumentParser();

  constructor(
    @InjectPinoLogger(DocumentProcessorService.name)
    private readonly logger: PinoLogger,
    private readonly neo4jService: Neo4jService,
    private readonly contentAnalysis: OpenAiContentAnalysisAdapter,
    private readonly documentAnalysis: OpenAiDocumentAnalysisAdapter,
    private readonly quizGeneration: OpenAiQuizGenerationAdapter,
    private readonly visionExtractor: OpenAiVisionTextExtractorAdapter,
    @Inject('FILE_STORAGE') private readonly fileStorage: IFileStorage,
  ) {
    super();
  }

  async process(job: Job<JobData>) {
    const { documentId, storagePath, filename, mimeType } = job.data;
    this.logger.info(
      { jobId: job.id, documentId, filename, mimeType },
      'Processing document',
    );

    try {
      // 1. PARSING stage
      await this.prisma.document.update({
        where: { id: documentId },
        data: {
          status: DocumentStatus.PROCESSING,
          processingStage: 'PARSING',
        },
      });
      await job.updateProgress({ stage: 'parsing' });

      const buffer = await this.fileStorage.download(storagePath);
      const resolvedMime = mimeType || this.guessMimeType(filename);
      const text = await this.extractText(buffer, resolvedMime);

      if (!text || text.trim().length === 0) {
        throw new Error('No text could be extracted from the document');
      }

      this.logger.info(
        { jobId: job.id, documentId, charCount: text.length },
        'Text extracted from document',
      );

      // 2. ANALYZING stage
      await this.prisma.document.update({
        where: { id: documentId },
        data: { processingStage: 'ANALYZING' },
      });
      await job.updateProgress({ stage: 'analyzing' });

      // Limit text for AI calls
      const truncatedText = text.substring(0, 15000);

      // 3. Fire all AI calls in parallel
      const summaryP = this.documentAnalysis.analyzeDocument(truncatedText);
      const conceptsP = this.contentAnalysis.extractConcepts(truncatedText);
      const quizP = this.quizGeneration.generateQuiz(truncatedText, [], { questionCount: 10 });

      // Phase 1: Summary (typically fastest) — save immediately
      const analysis = await summaryP;
      await this.saveSummary(documentId, analysis);
      await this.prisma.document.update({
        where: { id: documentId },
        data: { processingStage: 'SUMMARIZED' },
      });
      await job.updateProgress({ stage: 'summarized' });

      this.logger.info(
        { jobId: job.id, documentId, stage: 'summarized' },
        'Summary saved, awaiting concepts + quiz',
      );

      // Phase 2: Concepts + Quiz — wait for both, handle partial failures
      const [conceptsResult, quizResult] = await Promise.allSettled([conceptsP, quizP]);

      let conceptCount = 0;

      if (conceptsResult.status === 'fulfilled') {
        const concepts = conceptsResult.value.map((e) =>
          Concept.create(randomUUID(), e.name, documentId, e.description),
        );
        await this.saveConcepts(concepts, conceptsResult.value, documentId);
        conceptCount = concepts.length;
        // Update conceptCount on summary
        await this.prisma.documentSummary.updateMany({
          where: { documentId },
          data: { conceptCount },
        });
      } else {
        this.logger.warn(
          { jobId: job.id, documentId, err: String(conceptsResult.reason) },
          'Concept extraction failed, continuing with partial results',
        );
      }

      if (quizResult.status === 'fulfilled') {
        await this.saveQuiz(documentId, analysis.topicArea, quizResult.value);
      } else {
        this.logger.warn(
          { jobId: job.id, documentId, err: String(quizResult.reason) },
          'Quiz generation failed, continuing with partial results',
        );
      }

      // If both failed, throw so the job is marked as failed
      if (conceptsResult.status === 'rejected' && quizResult.status === 'rejected') {
        throw new Error('Both concept extraction and quiz generation failed');
      }

      // Phase 3: Finalize
      await this.prisma.document.update({
        where: { id: documentId },
        data: {
          status: DocumentStatus.COMPLETED,
          processingStage: 'READY',
          conceptCount,
        },
      });
      await job.updateProgress({ stage: 'ready' });

      this.logger.info(
        { jobId: job.id, documentId, conceptCount, stage: 'ready' },
        'Document fully processed',
      );
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error({ jobId: job.id, documentId, err }, 'Document processing failed');
      await this.prisma.document.update({
        where: { id: documentId },
        data: {
          status: DocumentStatus.FAILED,
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      throw error;
    }
  }

  private async extractText(buffer: Buffer, mimeType: string): Promise<string> {
    // Image files → OpenAI Vision
    if (mimeType.startsWith('image/')) {
      return this.visionExtractor.extractText(buffer, mimeType);
    }

    // Plain text files
    if (mimeType.startsWith('text/')) {
      return buffer.toString('utf-8');
    }

    // Document files → Composite parser (PDF, DOCX, XLSX)
    if (this.parser.supports(mimeType)) {
      const result = await this.parser.parse(buffer, mimeType);
      return result.text;
    }

    // Fallback: try as text
    this.logger.warn({ mimeType }, 'Unknown MIME type, attempting text decode');
    return buffer.toString('utf-8');
  }

  private guessMimeType(filename: string): string {
    const ext = filename.toLowerCase().split('.').pop();
    const mimeMap: Record<string, string> = {
      pdf: 'application/pdf',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      txt: 'text/plain',
      md: 'text/markdown',
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      webp: 'image/webp',
    };
    return mimeMap[ext || ''] || 'application/octet-stream';
  }

  private async saveSummary(
    documentId: string,
    analysis: { overview: string; keyPoints: string[]; topicArea: string; difficulty: string },
  ) {
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
    questions: { type: QuestionType; text: string; options: unknown[]; explanation?: string; difficulty: string }[],
  ) {
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
  ) {
    const session = this.neo4jService.getDriver().session();
    try {
      await session.run(`MERGE (d:Document {id: $id})`, { id: documentId });

      for (const concept of concepts) {
        await session.run(
          `
          MATCH (d:Document {id: $documentId})
          MERGE (c:Concept {id: $id})
          SET c.name = $name, c.description = $description, c.documentId = $documentId
          MERGE (d)-[:CONTAINS]->(c)
        `,
          {
            id: concept.id,
            name: concept.name,
            description: concept.description || '',
            documentId: concept.documentId,
          },
        );
      }

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
            await session.run(
              `
              MATCH (a:Concept {id: $sourceId})
              MATCH (b:Concept {id: $targetId})
              MERGE (a)-[:${rel.type}]->(b)
            `,
              {
                sourceId: sourceConcept.id,
                targetId: targetConcept.id,
              },
            );
          }
        }
      }

      this.logger.info(
        { documentId, conceptCount: concepts.length },
        'Saved concepts to Neo4j',
      );
    } finally {
      await session.close();
    }
  }
}
