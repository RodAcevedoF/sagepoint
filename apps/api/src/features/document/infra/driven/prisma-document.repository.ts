import {
  IDocumentRepository,
  Document,
  DocumentStatus,
  ProcessingStage,
} from '@sagepoint/domain';
import type { Document as PrismaDocument } from '@sagepoint/database';
import { PrismaService } from '@/core/infra/database/prisma.service';

export class PrismaDocumentRepository implements IDocumentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(document: Document): Promise<void> {
    await this.prisma.document.upsert({
      where: { id: document.id },
      create: {
        id: document.id,
        filename: document.filename,
        storagePath: document.storagePath,
        status: document.status as string,
        userId: document.userId,
        errorMessage: document.errorMessage,
        processingStage: document.processingStage ?? 'UPLOADED',
        mimeType: document.mimeType,
        fileSize: document.fileSize,
        conceptCount: document.conceptCount,
        createdAt: document.createdAt,
        updatedAt: document.updatedAt,
      },
      update: {
        status: document.status as string,
        errorMessage: document.errorMessage,
        processingStage: document.processingStage ?? undefined,
        mimeType: document.mimeType ?? undefined,
        fileSize: document.fileSize ?? undefined,
        conceptCount: document.conceptCount ?? undefined,
        updatedAt: document.updatedAt,
      },
    });
  }

  async findById(id: string): Promise<Document | null> {
    const data = await this.prisma.document.findUnique({ where: { id } });
    if (!data) return null;
    return this.mapToDomain(data);
  }

  async findAll(): Promise<Document[]> {
    const data = await this.prisma.document.findMany();
    return data.map((d) => this.mapToDomain(d));
  }

  async findByUserId(userId: string): Promise<Document[]> {
    const data = await this.prisma.document.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return data.map((d) => this.mapToDomain(d));
  }

  async delete(id: string): Promise<void> {
    await this.prisma.document.delete({ where: { id } });
  }

  private mapToDomain(data: PrismaDocument): Document {
    return new Document(
      data.id,
      data.filename,
      data.storagePath,
      data.status as DocumentStatus,
      data.userId,
      data.createdAt,
      data.updatedAt,
      data.errorMessage ?? undefined,
      0,
      data.processingStage as ProcessingStage,
      data.mimeType ?? undefined,
      data.fileSize ?? undefined,
      data.conceptCount ?? undefined,
    );
  }
}
