import { ResourceLimits } from "@sagepoint/domain";
import type { IResourceLimitsRepository } from "@sagepoint/domain";
import type { PrismaClient } from "../generated/prisma/client";

export class PrismaResourceLimitsRepository implements IResourceLimitsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByUserId(userId: string): Promise<ResourceLimits | null> {
    const row = await this.prisma.userResourceLimits.findUnique({
      where: { userId },
    });
    if (!row) return null;
    return new ResourceLimits(row.userId, row.maxDocuments, row.maxRoadmaps);
  }

  async save(limits: ResourceLimits): Promise<void> {
    await this.prisma.userResourceLimits.upsert({
      where: { userId: limits.userId },
      create: {
        userId: limits.userId,
        maxDocuments: limits.maxDocuments,
        maxRoadmaps: limits.maxRoadmaps,
      },
      update: {
        maxDocuments: limits.maxDocuments,
        maxRoadmaps: limits.maxRoadmaps,
      },
    });
  }
}
