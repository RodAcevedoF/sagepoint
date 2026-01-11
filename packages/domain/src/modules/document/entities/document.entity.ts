export enum DocumentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export class Document {
  constructor(
    public readonly id: string,
    public readonly filename: string,
    public readonly storagePath: string,
    public readonly status: DocumentStatus,
    public readonly userId: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly errorMessage?: string,
    public readonly progress: number = 0,
  ) {}

  static create(id: string, filename: string, storagePath: string, userId: string): Document {
    return new Document(
      id,
      filename,
      storagePath,
      DocumentStatus.PENDING,
      userId,
      new Date(),
      new Date(),
    );
  }

  markAsProcessing(): Document {
    return new Document(
      this.id,
      this.filename,
      this.storagePath,
      DocumentStatus.PROCESSING,
      this.userId,
      this.createdAt,
      new Date(),
    );
  }

  markAsCompleted(): Document {
    return new Document(
      this.id,
      this.filename,
      this.storagePath,
      DocumentStatus.COMPLETED,
      this.userId,
      this.createdAt,
      new Date(),
    );
  }

  markAsFailed(error: string): Document {
    return new Document(
      this.id,
      this.filename,
      this.storagePath,
      DocumentStatus.FAILED,
      this.userId,
      this.createdAt,
      new Date(),
      error,
    );
  }
}
