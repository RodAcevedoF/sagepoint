export const DOCUMENT_PROCESSING_QUEUE = Symbol('DOCUMENT_PROCESSING_QUEUE');

export interface IDocumentProcessingQueue {
  add(documentId: string, storagePath: string, filename: string, mimeType: string): Promise<void>;
}
