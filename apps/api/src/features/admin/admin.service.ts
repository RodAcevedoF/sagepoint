import { Inject, Injectable } from '@nestjs/common';
import type { Queue } from 'bullmq';
import { PrismaService } from '@/core/infra/database/prisma.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('DOCUMENT_QUEUE') private readonly documentQueue: Queue,
    @Inject('ROADMAP_QUEUE') private readonly roadmapQueue: Queue,
  ) {}

  async getStats() {
    const [
      userCount,
      documentCount,
      roadmapCount,
      quizCount,
      documentsByStage,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.document.count(),
      this.prisma.roadmap.count(),
      this.prisma.quiz.count(),
      this.prisma.document.groupBy({
        by: ['processingStage'],
        _count: { id: true },
      }),
    ]);

    const stageMap: Record<string, number> = {};
    for (const group of documentsByStage) {
      stageMap[group.processingStage] = group._count.id;
    }

    return {
      userCount,
      documentCount,
      roadmapCount,
      quizCount,
      documentsByStage: stageMap,
    };
  }

  async getQueueStats() {
    const getStats = async (queue: Queue) => {
      const [counts, failed] = await Promise.all([
        queue.getJobCounts(),
        queue.getFailed(0, 4),
      ]);
      return {
        name: queue.name,
        counts,
        recentFailures: failed.map((job) => ({
          id: job.id,
          name: job.name,
          failedReason: job.failedReason,
          timestamp: job.timestamp,
        })),
      };
    };

    const [documentQueue, roadmapQueue] = await Promise.all([
      getStats(this.documentQueue),
      getStats(this.roadmapQueue),
    ]);

    return { documentQueue, roadmapQueue };
  }

  async getUsers() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        onboardingStatus: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return users;
  }
}
