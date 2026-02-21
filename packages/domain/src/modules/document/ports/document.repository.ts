import type { Document } from '../entities/document.entity';

export const DOCUMENT_REPOSITORY = Symbol('DOCUMENT_REPOSITORY');

export interface IDocumentRepository {
  save(document: Document): Promise<void>;
  findById(id: string): Promise<Document | null>;
  findAll(): Promise<Document[]>;
  findByUserId(userId: string): Promise<Document[]>;
  delete(id: string): Promise<void>;
}
