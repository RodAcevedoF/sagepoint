import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger, Inject } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaClient, Prisma } from '@sagepoint/database';
import { CompositeDocumentParser } from '@sagepoint/parsing';
import { DocumentStatus, Concept } from '@sagepoint/domain';
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
  private readonly logger = new Logger(DocumentProcessorService.name);
  private readonly prisma = new PrismaClient();
  private readonly parser = new CompositeDocumentParser();

  constructor(
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
    this.logger.log(`Processing document: ${documentId} (${filename}, ${mimeType ?? 'unknown'})`);

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

      this.logger.log(`Extracted ${text.length} chars from document`);

      // 2. ANALYZING stage
      await this.prisma.document.update({
        where: { id: documentId },
        data: { processingStage: 'ANALYZING' },
      });
      await job.updateProgress({ stage: 'analyzing' });

      // Limit text for AI calls
      const truncatedText = text.substring(0, 15000);

      // 3. Parallel AI processing
      const [extracted, analysis, questions] = await Promise.all([
        this.contentAnalysis.extractConcepts(truncatedText),
        this.documentAnalysis.analyzeDocument(truncatedText),
        this.quizGeneration.generateQuiz(truncatedText, [], { questionCount: 10 }),
      ]);

      // 4. Save concepts to Neo4j
      const concepts = extracted.map((e) =>
        Concept.create(randomUUID(), e.name, documentId, e.description),
      );
      await this.saveConcepts(concepts, extracted, documentId);

      // 5. Save DocumentSummary
      await this.prisma.documentSummary.create({
        data: {
          id: randomUUID(),
          documentId,
          overview: analysis.overview,
          keyPoints: analysis.keyPoints,
          topicArea: analysis.topicArea,
          difficulty: analysis.difficulty,
          conceptCount: concepts.length,
        },
      });

      // 6. Save Quiz + Questions
      const quizId = randomUUID();
      await this.prisma.quiz.create({
        data: {
          id: quizId,
          documentId,
          title: `${analysis.topicArea} Quiz`,
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

      // 7. Mark READY
      await this.prisma.document.update({
        where: { id: documentId },
        data: {
          status: DocumentStatus.COMPLETED,
          processingStage: 'READY',
          conceptCount: concepts.length,
        },
      });
      await job.updateProgress({ stage: 'ready' });

      this.logger.log(
        `Document ${documentId} fully processed: ${concepts.length} concepts, summary saved, ${questions.length} quiz questions`,
      );
    } catch (error) {
      this.logger.error(`Job failed for ${documentId}`, error);
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
    this.logger.warn(`Unknown MIME type "${mimeType}", attempting text decode`);
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

      this.logger.log(
        `Saved ${concepts.length} concepts to Neo4j for document ${documentId}`,
      );
    } finally {
      await session.close();
    }
  }
}
