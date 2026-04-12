import {
  Document,
  IDocumentRepository,
  IFileStorage,
  IDocumentProcessingQueue,
  IUserRepository,
  TokenBalance,
  InsufficientTokensError,
  UserRole,
  OPERATION_COSTS,
} from '@sagepoint/domain';
import type { ITokenBalanceRepository } from '@sagepoint/domain';
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
    private readonly tokenBalanceRepository: ITokenBalanceRepository,
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(command: UploadDocumentCommand): Promise<Document> {
    // Pre-flight token check (admins bypass)
    const user = await this.userRepository.findById(command.userId);
    if (user && user.role !== UserRole.ADMIN) {
      const balance =
        (await this.tokenBalanceRepository.findByUserId(command.userId)) ??
        TokenBalance.defaults(command.userId);
      if (!balance.canAfford(OPERATION_COSTS.DOCUMENT_UPLOAD)) {
        throw new InsufficientTokensError(
          OPERATION_COSTS.DOCUMENT_UPLOAD,
          balance.balance ?? 0,
        );
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
      command.userId,
    );

    return document;
  }
}
