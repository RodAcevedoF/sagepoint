import type { ILikeRepository } from "@sagepoint/domain";
import type { PrismaClient } from "../generated/prisma/client";

export class PrismaLikeRepository implements ILikeRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async like(userId: string, roadmapId: string): Promise<void> {
    await this.prisma.roadmapLike.upsert({
      where: { userId_roadmapId: { userId, roadmapId } },
      create: { userId, roadmapId },
      update: {},
    });
  }

  async unlike(userId: string, roadmapId: string): Promise<void> {
    await this.prisma.roadmapLike.deleteMany({
      where: { userId, roadmapId },
    });
  }

  async isLiked(userId: string, roadmapId: string): Promise<boolean> {
    const count = await this.prisma.roadmapLike.count({
      where: { userId, roadmapId },
    });
    return count > 0;
  }

  async getLikeCount(roadmapId: string): Promise<number> {
    return this.prisma.roadmapLike.count({ where: { roadmapId } });
  }

  async getLikeCountsBatch(
    roadmapIds: string[],
  ): Promise<Record<string, number>> {
    if (roadmapIds.length === 0) return {};

    const groups = await this.prisma.roadmapLike.groupBy({
      by: ["roadmapId"],
      where: { roadmapId: { in: roadmapIds } },
      _count: { roadmapId: true },
    });

    const counts: Record<string, number> = {};
    for (const id of roadmapIds) {
      counts[id] = 0;
    }
    for (const group of groups) {
      counts[group.roadmapId] = group._count.roadmapId;
    }
    return counts;
  }

  async getLikedRoadmapIds(userId: string): Promise<string[]> {
    const likes = await this.prisma.roadmapLike.findMany({
      where: { userId },
      select: { roadmapId: true },
      orderBy: { createdAt: "desc" },
    });
    return likes.map((l) => l.roadmapId);
  }
}
