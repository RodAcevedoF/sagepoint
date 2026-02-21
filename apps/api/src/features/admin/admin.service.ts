import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/infra/database/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

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
