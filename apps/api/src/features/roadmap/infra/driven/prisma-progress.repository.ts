import {
  IProgressRepository,
  UserRoadmapProgress,
  RoadmapProgressSummary,
  StepStatus,
} from '@sagepoint/domain';
import type { UserRoadmapProgress as PrismaProgress } from '@sagepoint/database';
import { PrismaService } from '@/core/infra/database/prisma.service';

interface SerializedStep {
  concept: { id: string };
}

export class PrismaProgressRepository implements IProgressRepository {
  constructor(private readonly prisma: PrismaService) {}

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

    return results.map((r) => this.mapToDomain(r));
  }

  async getProgressSummary(
    userId: string,
    roadmapId: string,
  ): Promise<RoadmapProgressSummary | null> {
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

    return {
      roadmapId,
      totalSteps,
      completedSteps,
      inProgressSteps,
      skippedSteps,
      progressPercentage: Math.round((completedSteps / totalSteps) * 100),
    };
  }

  async getProgressSummariesForUser(
    userId: string,
  ): Promise<RoadmapProgressSummary[]> {
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

    return roadmaps.map((roadmap) => {
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
