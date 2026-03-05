import type { Document } from '../entities/document.entity';
import type {
  CursorPaginationParams,
  CursorPaginatedResult,
} from '../../../common/pagination';

export const DOCUMENT_REPOSITORY = Symbol('DOCUMENT_REPOSITORY');

export interface IDocumentRepository {
  save(document: Document): Promise<void>;
  findById(id: string): Promise<Document | null>;
  findAll(): Promise<Document[]>;
  findByUserId(userId: string): Promise<Document[]>;
  findByUserIdCursor(
    userId: string,
    params: CursorPaginationParams,
  ): Promise<CursorPaginatedResult<Document>>;
  delete(id: string): Promise<void>;
}
