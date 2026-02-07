
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger, Inject } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaClient } from '@sagepoint/database';
import { PdfParser, ParsedDocument } from '@sagepoint/parsing';
import { DocumentStatus, Concept } from '@sagepoint/domain';
import type { IFileStorage, ExtractedConcept } from '@sagepoint/domain';
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
           // Simple text parsing for .txt, .md
           const text = buffer.toString('utf-8');
           result = { text, metadata: { type: 'text/plain' } };
      }

      this.logger.log(`Parsed content length: ${result.text.length}`);

      // 4. Extract Concepts (Real AI)
      this.logger.log(`Asking OpenAI to extract concepts...`);
      const extracted = await this.contentAnalysis.extractConcepts(result.text.substring(0, 15000)); // Limit context window
      
      const concepts: Concept[] = extracted.map(e => 
        Concept.create(randomUUID(), e.name, documentId, e.description)
      );

      // 5. Save to Neo4j
      await this.saveConcepts(concepts, extracted, documentId);

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

  private async saveConcepts(concepts: Concept[], extracted: ExtractedConcept[], documentId: string) {
    const session = this.neo4jService.getDriver().session();
    try {
      // Create Document Node first
      await session.run(`MERGE (d:Document {id: $id})`, { id: documentId });

      // 1. Create all Concept Nodes
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

      // 2. Create Relationships between Concepts
      this.logger.log(`Processing relationships for ${extracted.length} concepts...`);
      
      for (const source of extracted) {
         if (!source.relationships || source.relationships.length === 0) continue;

         // Find the ID of the source concept (case-insensitive)
         const sourceConcept = concepts.find(c => c.name.toLowerCase() === source.name.toLowerCase().trim());
         if (!sourceConcept) {
             this.logger.warn(`Source concept '${source.name}' not found in saved entities. Skipping relationships.`);
             continue;
         }

         for (const rel of source.relationships) {
            // Find the target concept by name (case-insensitive)
            const targetConcept = concepts.find(c => c.name.toLowerCase() === rel.targetName.toLowerCase().trim());
            
            if (targetConcept) {
                this.logger.log(`Creating relationship: (${source.name}) -[:${rel.type}]-> (${targetConcept.name})`);
                
                await session.run(`
                    MATCH (a:Concept {id: $sourceId})
                    MATCH (b:Concept {id: $targetId})
                    MERGE (a)-[:${rel.type}]->(b)
                `, {
                    sourceId: sourceConcept.id,
                    targetId: targetConcept.id
                });
            } else {
                this.logger.warn(`Target concept '${rel.targetName}' not found for relationship from '${source.name}'. Available: ${concepts.map(c => c.name).join(', ')}`);
            }
         }
      }

      this.logger.log(`Saved ${concepts.length} concepts and relationships to Graph for document ${documentId}`);
    } catch (error) {
       this.logger.error(`Failed to save concepts: ${error instanceof Error ? error.message : 'Unknown error'}`);
       throw error;
    } finally {
      await session.close();
    }
  }
}
