import {
  IProgressRepository,
  UserRoadmapProgress,
  RoadmapProgressSummary,
  StepStatus,
} from '@sagepoint/domain';
import { PrismaService } from '@/core/infra/database/prisma.service';

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

  async findByUserAndRoadmap(userId: string, roadmapId: string): Promise<UserRoadmapProgress[]> {
    const data = await this.prisma.userRoadmapProgress.findMany({
      where: { userId, roadmapId },
    });
    return data.map(this.mapToDomain);
  }

  async findByUserRoadmapAndConcept(
    userId: string,
    roadmapId: string,
    conceptId: string
  ): Promise<UserRoadmapProgress | null> {
    const data = await this.prisma.userRoadmapProgress.findUnique({
      where: {
        userId_roadmapId_conceptId: { userId, roadmapId, conceptId },
      },
    });
    return data ? this.mapToDomain(data) : null;
  }

  async upsertMany(progressList: UserRoadmapProgress[]): Promise<UserRoadmapProgress[]> {
    if (progressList.length === 0) return [];

    // Use transaction for batch upsert
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
        })
      )
    );

    return results.map(this.mapToDomain);
  }

  async getProgressSummary(userId: string, roadmapId: string): Promise<RoadmapProgressSummary | null> {
    // Get roadmap to count total steps
    const roadmap = await this.prisma.roadmap.findUnique({
      where: { id: roadmapId },
      select: { steps: true },
    });

    if (!roadmap) return null;

    const steps = roadmap.steps as any[];
    const totalSteps = steps?.length || 0;

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

    // Aggregate progress counts in single query
    const counts = await this.prisma.userRoadmapProgress.groupBy({
      by: ['status'],
      where: { userId, roadmapId },
      _count: { status: true },
    });

    const statusCounts = counts.reduce(
      (acc, curr) => {
        acc[curr.status] = curr._count.status;
        return acc;
      },
      {} as Record<string, number>
    );

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

  async getProgressSummariesForUser(userId: string): Promise<RoadmapProgressSummary[]> {
    // Get all roadmaps for user with their progress in efficient queries
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
      const steps = roadmap.steps as any[];
      const totalSteps = steps?.length || 0;

      const statusCounts = roadmap.progress.reduce(
        (acc, p) => {
          acc[p.status] = (acc[p.status] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
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
        progressPercentage: totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0,
      };
    });
  }

  async getCompletedConceptIds(userId: string, roadmapId: string): Promise<string[]> {
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

  async deleteByUserAndRoadmap(userId: string, roadmapId: string): Promise<void> {
    await this.prisma.userRoadmapProgress.deleteMany({
      where: { userId, roadmapId },
    });
  }

  private mapToDomain(data: any): UserRoadmapProgress {
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
