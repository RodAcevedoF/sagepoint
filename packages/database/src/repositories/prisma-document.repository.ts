import {
  IDocumentRepository,
  Document,
  DocumentStatus,
  ProcessingStage,
} from "@sagepoint/domain";
import type {
  CursorPaginationParams,
  CursorPaginatedResult,
} from "@sagepoint/domain";
import type { Document as PrismaDocument } from "../generated/prisma/client";
import type { PrismaClient } from "../generated/prisma/client";

export class PrismaDocumentRepository implements IDocumentRepository {
  constructor(private readonly prisma: PrismaClient) {}

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
        processingStage: document.processingStage ?? "UPLOADED",
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
      orderBy: { createdAt: "desc" },
    });
    return data.map((d) => this.mapToDomain(d));
  }

  async findByUserIdCursor(
    userId: string,
    params: CursorPaginationParams,
  ): Promise<CursorPaginatedResult<Document>> {
    const where = { userId };
    const cursorClause = params.cursor
      ? { createdAt: { lt: new Date(params.cursor) } }
      : {};

    const [rows, total] = await Promise.all([
      this.prisma.document.findMany({
        where: { ...where, ...cursorClause },
        orderBy: { createdAt: "desc" },
        take: params.limit + 1,
      }),
      this.prisma.document.count({ where }),
    ]);

    const hasMore = rows.length > params.limit;
    const data = hasMore ? rows.slice(0, params.limit) : rows;
    const lastItem = data[data.length - 1];

    return {
      data: data.map((d) => this.mapToDomain(d)),
      nextCursor: hasMore && lastItem ? lastItem.createdAt.toISOString() : null,
      hasMore,
      total,
    };
  }

  async updateStatus(
    id: string,
    fields: {
      status?: DocumentStatus;
      processingStage?: ProcessingStage;
      conceptCount?: number;
      errorMessage?: string;
    },
  ): Promise<void> {
    await this.prisma.document.update({
      where: { id },
      data: {
        ...(fields.status !== undefined && { status: fields.status as string }),
        ...(fields.processingStage !== undefined && {
          processingStage: fields.processingStage,
        }),
        ...(fields.conceptCount !== undefined && {
          conceptCount: fields.conceptCount,
        }),
        ...(fields.errorMessage !== undefined && {
          errorMessage: fields.errorMessage,
        }),
        updatedAt: new Date(),
      },
    });
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
