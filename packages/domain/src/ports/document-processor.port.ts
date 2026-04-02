export const DOCUMENT_PROCESSOR_SERVICE = Symbol("DOCUMENT_PROCESSOR_SERVICE");

export interface DocumentProcessingInput {
  documentId: string;
  storagePath: string;
  filename: string;
  mimeType?: string;
}

export interface DocumentProcessingProgress {
  stage: "parsing" | "analyzing" | "summarized" | "extracting" | "ready";
}

export interface IDocumentProcessorService {
  processDocument(
    input: DocumentProcessingInput,
    onProgress?: (progress: DocumentProcessingProgress) => void,
  ): Promise<void>;
}
