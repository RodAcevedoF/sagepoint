import { Document } from "@sagepoint/domain";

export const DOCUMENT_SERVICE = Symbol('DOCUMENT_SERVICE');

export interface UploadDocumentInput {
  filename: string;
  mimeType: string;
  size: number;
  fileBuffer: Buffer;
  userId: string;
}

export interface IDocumentService {
  upload(input: UploadDocumentInput): Promise<Document>
  get(id: string): Promise<Document | null>
  list(): Promise<Document[]>;
}
