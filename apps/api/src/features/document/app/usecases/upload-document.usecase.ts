import {
  Document,
  IDocumentRepository,
  IFileStorage,
  IDocumentProcessingQueue,
  IUserRepository,
  ResourceLimits,
  DocumentLimitExceededError,
  UserRole,
} from '@sagepoint/domain';
import type { IResourceLimitsRepository } from '@sagepoint/domain';
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
    private readonly resourceLimitsRepository: IResourceLimitsRepository,
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(command: UploadDocumentCommand): Promise<Document> {
    // Enforce document limit (admins bypass)
    const user = await this.userRepository.findById(command.userId);
    if (user && user.role !== UserRole.ADMIN) {
      const limits =
        (await this.resourceLimitsRepository.findByUserId(command.userId)) ??
        ResourceLimits.defaults(command.userId);
      const currentCount = await this.documentRepository.countByUserId(
        command.userId,
      );
      if (!limits.isDocumentAllowed(currentCount)) {
        throw new DocumentLimitExceededError(limits.maxDocuments!);
      }
    }

    const id = randomUUID();

    // 1. Upload file to storage
    const path = `documents/${id}/${command.filename}`;
    // Domain Port Signature: upload(path: string, content: Buffer)
    const storagePath = await this.fileStorage.upload(
      path,
      command.fileBuffer,
      command.mimeType,
    );

    // 2. Create entity
    const document = Document.create(
      id,
      command.filename,
      storagePath,
      command.userId,
    );

    // 3. Save metadata
    await this.documentRepository.save(document);

    // 4. Trigger Processing
    await this.processingQueue.add(
      document.id,
      storagePath,
      command.filename,
      command.mimeType,
    );

    return document;
  }
}
