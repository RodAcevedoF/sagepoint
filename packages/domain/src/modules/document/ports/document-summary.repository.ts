import type { DocumentSummary } from '../entities/document-summary.entity';

export const DOCUMENT_SUMMARY_REPOSITORY = Symbol('DOCUMENT_SUMMARY_REPOSITORY');

export interface IDocumentSummaryRepository {
  save(summary: DocumentSummary): Promise<void>;
  findByDocumentId(documentId: string): Promise<DocumentSummary | null>;
  deleteByDocumentId(documentId: string): Promise<void>;
}
