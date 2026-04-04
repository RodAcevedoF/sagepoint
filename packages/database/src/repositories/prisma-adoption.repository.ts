import type { IAdoptionRepository } from "@sagepoint/domain";
import type { PrismaClient } from "../generated/prisma/client";

export class PrismaAdoptionRepository implements IAdoptionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async adopt(userId: string, roadmapId: string): Promise<void> {
    await this.prisma.userAdoptedRoadmap.upsert({
      where: { userId_roadmapId: { userId, roadmapId } },
      create: { userId, roadmapId },
      update: {},
    });
  }

  async unadopt(userId: string, roadmapId: string): Promise<void> {
    await this.prisma.userAdoptedRoadmap.deleteMany({
      where: { userId, roadmapId },
    });
  }

  async isAdopted(userId: string, roadmapId: string): Promise<boolean> {
    const count = await this.prisma.userAdoptedRoadmap.count({
      where: { userId, roadmapId },
    });
    return count > 0;
  }

  async findAdoptedRoadmapIds(userId: string): Promise<string[]> {
    const records = await this.prisma.userAdoptedRoadmap.findMany({
      where: { userId },
      select: { roadmapId: true },
      orderBy: { adoptedAt: "desc" },
    });
    return records.map((r) => r.roadmapId);
  }
}
