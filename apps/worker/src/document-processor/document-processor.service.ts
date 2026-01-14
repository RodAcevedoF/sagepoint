
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger, Inject } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaClient } from '@sagepoint/database';
import { PdfParser, ParsedDocument } from '@sagepoint/parsing';
import { DocumentStatus, Concept } from '@sagepoint/domain';
import type { IFileStorage } from '@sagepoint/domain';
import { OpenAiContentAnalysisAdapter } from '@sagepoint/ai';
import { Neo4jService } from '@sagepoint/graph';
import { randomUUID } from 'crypto';

@Processor('document-processing')
export class DocumentProcessorService extends WorkerHost {
  private readonly logger = new Logger(DocumentProcessorService.name);
  private readonly prisma = new PrismaClient();
  private readonly pdfParser = new PdfParser();

  constructor(
    private readonly neo4jService: Neo4jService,
    private readonly contentAnalysis: OpenAiContentAnalysisAdapter,
    @Inject('FILE_STORAGE') private readonly fileStorage: IFileStorage,
  ) {
    super();
  }
  
  async process(job: Job<{ documentId: string; storagePath: string; filename: string }>) {
    const { documentId, storagePath, filename } = job.data;
    this.logger.log(`Processing job for document: ${documentId} (${filename})`);

    try {
      // 1. Update Status
      await this.prisma.document.update({
        where: { id: documentId },
        data: { status: DocumentStatus.PROCESSING },
      });

      // 2. Read File from Storage
      const buffer = await this.fileStorage.download(storagePath);

      // 3. Parse
      let result: ParsedDocument;
      if (filename.toLowerCase().endsWith('.pdf')) {
           result = await this.pdfParser.parse(buffer, 'application/pdf');
      } else {
          // Fallback or error
          result = { text: "Simulated Text", metadata: {} };
      }

      this.logger.log(`Parsed content length: ${result.text.length}`);

      // 4. Extract Concepts (Real AI)
      this.logger.log(`Asking OpenAI to extract concepts...`);
      const extracted = await this.contentAnalysis.extractConcepts(result.text.substring(0, 15000)); // Limit context window
      
      const concepts: Concept[] = extracted.map(e => 
        Concept.create(randomUUID(), e.name, documentId, e.description)
      );

      // 5. Save to Neo4j
      await this.saveConcepts(concepts, documentId);

      // 6. Update DB
      await this.prisma.document.update({
        where: { id: documentId },
        data: { 
            status: DocumentStatus.COMPLETED,
        },
      });

    } catch (error) {
       this.logger.error(`Job failed for ${documentId}`, error);
       await this.prisma.document.update({
          where: { id: documentId },
          data: { 
            status: DocumentStatus.FAILED,
            errorMessage: error instanceof Error ? error.message : 'Unknown error'
          },
        });
        throw error; // Fail job
    }
  }

  private async saveConcepts(concepts: Concept[], documentId: string) {
    const session = this.neo4jService.getDriver().session();
    try {
      // Create Document Node first
      await session.run(`MERGE (d:Document {id: $id})`, { id: documentId });

      for (const concept of concepts) {
        await session.run(`
          MATCH (d:Document {id: $documentId})
          MERGE (c:Concept {id: $id})
          SET c.name = $name, c.description = $description, c.documentId = $documentId
          MERGE (d)-[:CONTAINS]->(c)
        `, {
          id: concept.id,
          name: concept.name,
          description: concept.description || '',
          documentId: concept.documentId
        });
      }
      this.logger.log(`Saved ${concepts.length} concepts to Graph for document ${documentId}`);
    } catch (error) {
       this.logger.error(`Failed to save concepts: ${error.message}`);
       throw error;
    } finally {
      await session.close();
    }
  }
}
