import { UploadDocumentUseCase } from '@/features/document/app/usecases/upload-document.usecase';
import { GetDocumentUseCase } from '@/features/document/app/usecases/get-document.usecase';
import { Document } from '@sagepoint/domain';
import {
  IDocumentService,
  UploadDocumentInput,
} from '@/features/document/domain/inbound/document.service';

export class DocumentService implements IDocumentService {
  constructor(
    private readonly uploadDocumentUseCase: UploadDocumentUseCase,
    private readonly getDocumentUseCase: GetDocumentUseCase,
  ) {}

  async upload(input: UploadDocumentInput): Promise<Document> {
    // Controller will pass the buffer now
    return await this.uploadDocumentUseCase.execute({
      filename: input.filename,
      mimeType: input.mimeType,
      size: input.size,
      fileBuffer: input.fileBuffer,
      userId: input.userId,
    });
  }

  async get(id: string): Promise<Document | null> {
    return await this.getDocumentUseCase.execute(id);
  }

  async list(): Promise<Document[]> {
    return await this.getDocumentUseCase.listAll();
  }
}
