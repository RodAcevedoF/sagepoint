import { IDocumentRepository, Document, DocumentStatus } from '@sagepoint/domain';
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
        createdAt: document.createdAt,
        updatedAt: document.updatedAt,
      },
      update: {
        status: document.status as string,
        errorMessage: document.errorMessage,
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
    return data.map(this.mapToDomain);
  }

  private mapToDomain(data: any): Document {
    return new Document(
      data.id,
      data.filename,
      data.storagePath,
      data.status as DocumentStatus,
      data.userId,
      data.createdAt,
      data.updatedAt,
      data.errorMessage || undefined,
      0 // Progress not stored in DB currently
    );
  }
}
