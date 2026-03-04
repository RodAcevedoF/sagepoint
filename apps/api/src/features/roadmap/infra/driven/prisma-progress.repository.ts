import {
  IProgressRepository,
  UserRoadmapProgress,
  RoadmapProgressSummary,
  StepStatus,
  type ICacheService,
} from '@sagepoint/domain';
import type { UserRoadmapProgress as PrismaProgress } from '@sagepoint/database';
import { PrismaService } from '@/core/infra/database/prisma.service';

interface SerializedStep {
  concept: { id: string };
}

const TTL_SECONDS = 600; // 10 minutes

export class PrismaProgressRepository implements IProgressRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache?: ICacheService,
  ) {}

  async upsert(progress: UserRoadmapProgress): Promise<UserRoadmapProgress> {
    const data = await this.prisma.userRoadmapProgress.upsert({
      where: {
        userId_roadmapId_conceptId: {
          userId: progress.userId,
          roadmapId: progress.roadmapId,
          conceptId: progress.conceptId,
        },
      },
      create: {
        userId: progress.userId,
        roadmapId: progress.roadmapId,
        conceptId: progress.conceptId,
        status: progress.status,
        completedAt: progress.completedAt,
      },
      update: {
        status: progress.status,
        completedAt: progress.completedAt,
      },
    });

    await this.invalidateCache(progress.userId, progress.roadmapId);

    return this.mapToDomain(data);
  }

  async findByUserAndRoadmap(
    userId: string,
    roadmapId: string,
  ): Promise<UserRoadmapProgress[]> {
    const data = await this.prisma.userRoadmapProgress.findMany({
      where: { userId, roadmapId },
    });
    return data.map((d) => this.mapToDomain(d));
  }

  async findByUserRoadmapAndConcept(
    userId: string,
    roadmapId: string,
    conceptId: string,
  ): Promise<UserRoadmapProgress | null> {
    const data = await this.prisma.userRoadmapProgress.findUnique({
      where: {
        userId_roadmapId_conceptId: { userId, roadmapId, conceptId },
      },
    });
    return data ? this.mapToDomain(data) : null;
  }

  async upsertMany(
    progressList: UserRoadmapProgress[],
  ): Promise<UserRoadmapProgress[]> {
    if (progressList.length === 0) return [];

    const results = await this.prisma.$transaction(
      progressList.map((progress) =>
        this.prisma.userRoadmapProgress.upsert({
          where: {
            userId_roadmapId_conceptId: {
              userId: progress.userId,
              roadmapId: progress.roadmapId,
              conceptId: progress.conceptId,
            },
          },
          create: {
            userId: progress.userId,
            roadmapId: progress.roadmapId,
            conceptId: progress.conceptId,
            status: progress.status,
            completedAt: progress.completedAt,
          },
          update: {
            status: progress.status,
            completedAt: progress.completedAt,
          },
        }),
      ),
    );

    // Invalidate cache for all affected user+roadmap pairs
    const seen = new Set<string>();
    for (const p of progressList) {
      const key = `${p.userId}:${p.roadmapId}`;
      if (!seen.has(key)) {
        seen.add(key);
        await this.invalidateCache(p.userId, p.roadmapId);
      }
    }

    return results.map((r) => this.mapToDomain(r));
  }

  async getProgressSummary(
    userId: string,
    roadmapId: string,
  ): Promise<RoadmapProgressSummary | null> {
    const cacheKey = `progress:${userId}:${roadmapId}`;

    if (this.cache) {
      const cached = await this.cache.get<RoadmapProgressSummary>(cacheKey);
      if (cached) return cached;
    }

    const roadmap = await this.prisma.roadmap.findUnique({
      where: { id: roadmapId },
      select: { steps: true },
    });

    if (!roadmap) return null;

    const steps = Array.isArray(roadmap.steps)
      ? (roadmap.steps as unknown as SerializedStep[])
      : [];
    const totalSteps = steps.length;

    if (totalSteps === 0) {
      return {
        roadmapId,
        totalSteps: 0,
        completedSteps: 0,
        inProgressSteps: 0,
        skippedSteps: 0,
        progressPercentage: 0,
      };
    }

    const counts = await this.prisma.userRoadmapProgress.groupBy({
      by: ['status'],
      where: { userId, roadmapId },
      _count: { status: true },
    });

    const statusCounts = counts.reduce<Record<string, number>>((acc, curr) => {
      acc[curr.status] = curr._count.status;
      return acc;
    }, {});

    const completedSteps = statusCounts['COMPLETED'] || 0;
    const inProgressSteps = statusCounts['IN_PROGRESS'] || 0;
    const skippedSteps = statusCounts['SKIPPED'] || 0;

    const summary: RoadmapProgressSummary = {
      roadmapId,
      totalSteps,
      completedSteps,
      inProgressSteps,
      skippedSteps,
      progressPercentage: Math.round((completedSteps / totalSteps) * 100),
    };

    if (this.cache) {
      await this.cache.set(cacheKey, summary, TTL_SECONDS);
    }

    return summary;
  }

  async getProgressSummariesForUser(
    userId: string,
  ): Promise<RoadmapProgressSummary[]> {
    const cacheKey = `progress:user:${userId}`;

    if (this.cache) {
      const cached = await this.cache.get<RoadmapProgressSummary[]>(cacheKey);
      if (cached) return cached;
    }

    const roadmaps = await this.prisma.roadmap.findMany({
      where: { userId },
      select: {
        id: true,
        steps: true,
        progress: {
          where: { userId },
          select: { status: true },
        },
      },
    });

    const summaries = roadmaps.map((roadmap) => {
      const steps = Array.isArray(roadmap.steps)
        ? (roadmap.steps as unknown as SerializedStep[])
        : [];
      const totalSteps = steps.length;

      const statusCounts = roadmap.progress.reduce<Record<string, number>>(
        (acc, p) => {
          acc[p.status] = (acc[p.status] || 0) + 1;
          return acc;
        },
        {},
      );

      const completedSteps = statusCounts['COMPLETED'] || 0;
      const inProgressSteps = statusCounts['IN_PROGRESS'] || 0;
      const skippedSteps = statusCounts['SKIPPED'] || 0;

      return {
        roadmapId: roadmap.id,
        totalSteps,
        completedSteps,
        inProgressSteps,
        skippedSteps,
        progressPercentage:
          totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0,
      };
    });

    if (this.cache) {
      await this.cache.set(cacheKey, summaries, TTL_SECONDS);
    }

    return summaries;
  }

  async getCompletedConceptIds(
    userId: string,
    roadmapId: string,
  ): Promise<string[]> {
    const completed = await this.prisma.userRoadmapProgress.findMany({
      where: {
        userId,
        roadmapId,
        status: 'COMPLETED',
      },
      select: { conceptId: true },
    });
    return completed.map((p) => p.conceptId);
  }

  async deleteByRoadmap(roadmapId: string): Promise<void> {
    await this.prisma.userRoadmapProgress.deleteMany({
      where: { roadmapId },
    });
  }

  async deleteByUserAndRoadmap(
    userId: string,
    roadmapId: string,
  ): Promise<void> {
    await this.prisma.userRoadmapProgress.deleteMany({
      where: { userId, roadmapId },
    });

    await this.invalidateCache(userId, roadmapId);
  }

  private async invalidateCache(
    userId: string,
    roadmapId: string,
  ): Promise<void> {
    if (!this.cache) return;
    await Promise.all([
      this.cache.del(`progress:${userId}:${roadmapId}`),
      this.cache.del(`progress:user:${userId}`),
    ]);
  }

  private mapToDomain(data: PrismaProgress): UserRoadmapProgress {
    return new UserRoadmapProgress({
      userId: data.userId,
      roadmapId: data.roadmapId,
      conceptId: data.conceptId,
      status: data.status as StepStatus,
      completedAt: data.completedAt || undefined,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }
}
