import type {
  Document,
  DocumentStatus,
  ProcessingStage,
} from "../entities/document.entity";
import type {
  CursorPaginationParams,
  CursorPaginatedResult,
} from "../../../common/pagination";

export const DOCUMENT_REPOSITORY = Symbol("DOCUMENT_REPOSITORY");

export interface DocumentStatusUpdate {
  status?: DocumentStatus;
  processingStage?: ProcessingStage;
  conceptCount?: number;
  errorMessage?: string;
}

export interface IDocumentRepository {
  save(document: Document): Promise<void>;
  findById(id: string): Promise<Document | null>;
  findAll(): Promise<Document[]>;
  findByUserId(userId: string): Promise<Document[]>;
  findByUserIdCursor(
    userId: string,
    params: CursorPaginationParams,
  ): Promise<CursorPaginatedResult<Document>>;
  updateStatus(id: string, fields: DocumentStatusUpdate): Promise<void>;
  delete(id: string): Promise<void>;
  countByUserId(userId: string): Promise<number>;
}
