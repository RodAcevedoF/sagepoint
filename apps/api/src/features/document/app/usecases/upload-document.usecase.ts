import { Document, IDocumentRepository, IFileStorage, IDocumentProcessingQueue } from '@sagepoint/domain';
import { randomUUID } from 'crypto';

export interface UploadDocumentCommand {
  filename: string;
  mimeType: string;
  userId: string;
  size: number;
  fileBuffer: Buffer;
}

export class UploadDocumentUseCase {
  constructor(
    private readonly documentRepository: IDocumentRepository,
    private readonly fileStorage: IFileStorage,
    private readonly processingQueue: IDocumentProcessingQueue,
  ) {}

  async execute(command: UploadDocumentCommand): Promise<Document> {
    const id = randomUUID();
    
    // 1. Upload file to storage
    const path = `documents/${id}/${command.filename}`;
    // Domain Port Signature: upload(path: string, content: Buffer)
    const storagePath = await this.fileStorage.upload(path, command.fileBuffer, command.mimeType);
    
    // 2. Create entity
    const document = Document.create(id, command.filename, storagePath, command.userId);
    
    // 3. Save metadata
    await this.documentRepository.save(document);

    // 4. Trigger Processing
    await this.processingQueue.add(document.id, storagePath, command.filename);
    
    return document;
  }
}
