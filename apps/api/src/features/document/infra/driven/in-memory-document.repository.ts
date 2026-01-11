import { Document } from '@sagepoint/domain';
import { IDocumentRepository } from '@sagepoint/domain';

export class InMemoryDocumentRepository implements IDocumentRepository {
  private documents: Map<string, Document> = new Map();

  async save(document: Document): Promise<void> {
    this.documents.set(document.id, document);
  }

  async findById(id: string): Promise<Document | null> {
    return this.documents.get(id) || null;
  }

  async findAll(): Promise<Document[]> {
    return Array.from(this.documents.values());
  }
}
