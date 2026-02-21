import type { IDocumentSummaryRepository } from '@sagepoint/domain';
import { DocumentSummary } from '@sagepoint/domain';
import type { DocumentSummary as PrismaDocumentSummary } from '@sagepoint/database';
import { PrismaService } from '@/core/infra/database/prisma.service';

export class PrismaDocumentSummaryRepository implements IDocumentSummaryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(summary: DocumentSummary): Promise<void> {
    await this.prisma.documentSummary.upsert({
      where: { documentId: summary.documentId },
      create: {
        id: summary.id,
        documentId: summary.documentId,
        overview: summary.overview,
        keyPoints: summary.keyPoints,
        topicArea: summary.topicArea,
        difficulty: summary.difficulty,
        estimatedReadTime: summary.estimatedReadTime,
        conceptCount: summary.conceptCount,
        createdAt: summary.createdAt,
      },
      update: {
        overview: summary.overview,
        keyPoints: summary.keyPoints,
        topicArea: summary.topicArea,
        difficulty: summary.difficulty,
        estimatedReadTime: summary.estimatedReadTime,
        conceptCount: summary.conceptCount,
      },
    });
  }

  async findByDocumentId(documentId: string): Promise<DocumentSummary | null> {
    const data = await this.prisma.documentSummary.findUnique({
      where: { documentId },
    });
    if (!data) return null;
    return this.mapToDomain(data);
  }

  async deleteByDocumentId(documentId: string): Promise<void> {
    await this.prisma.documentSummary.deleteMany({ where: { documentId } });
  }

  private mapToDomain(data: PrismaDocumentSummary): DocumentSummary {
    return new DocumentSummary(
      data.id,
      data.documentId,
      data.overview,
      data.keyPoints as string[],
      data.topicArea,
      data.difficulty,
      data.conceptCount,
      data.createdAt,
      data.estimatedReadTime ?? undefined,
    );
  }
}
