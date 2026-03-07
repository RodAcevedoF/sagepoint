import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Queue } from 'bullmq';
import { Prisma } from '@sagepoint/database';
import { PrismaService } from '@/core/infra/database/prisma.service';
import type { UpdateAdminUserDto } from './dto/update-admin-user.dto';
import type { GetAdminRoadmapsDto } from './dto/get-admin-roadmaps.dto';
import type { GetAdminDocumentsDto } from './dto/get-admin-documents.dto';

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
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        isVerified: true,
        createdAt: true,
        onboardingStatus: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateUser(id: string, data: UpdateAdminUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    const updateData: Prisma.UserUpdateInput = {};
    if (data.role !== undefined)
      updateData.role = data.role as 'ADMIN' | 'USER';
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    return this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        isVerified: true,
        createdAt: true,
        onboardingStatus: true,
      },
    });
  }

  async getRoadmaps(query: GetAdminRoadmapsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.RoadmapWhereInput = {};
    if (query.status)
      where.generationStatus =
        query.status as Prisma.EnumRoadmapGenerationStatusFilter['equals'];
    if (query.categoryId) where.categoryId = query.categoryId;

    const [data, total] = await Promise.all([
      this.prisma.roadmap.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          generationStatus: true,
          isFeatured: true,
          visibility: true,
          createdAt: true,
          user: { select: { id: true, name: true, email: true } },
          category: { select: { id: true, name: true } },
        },
      }),
      this.prisma.roadmap.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async deleteRoadmap(id: string) {
    const roadmap = await this.prisma.roadmap.findUnique({ where: { id } });
    if (!roadmap) throw new NotFoundException('Roadmap not found');

    await this.prisma.roadmap.delete({ where: { id } });
    return { success: true };
  }

  async toggleRoadmapFeatured(id: string) {
    const roadmap = await this.prisma.roadmap.findUnique({ where: { id } });
    if (!roadmap) throw new NotFoundException('Roadmap not found');

    return this.prisma.roadmap.update({
      where: { id },
      data: { isFeatured: !roadmap.isFeatured },
      select: { id: true, isFeatured: true },
    });
  }

  async getDocuments(query: GetAdminDocumentsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.DocumentWhereInput = {};
    if (query.stage)
      where.processingStage =
        query.stage as Prisma.EnumProcessingStageFilter['equals'];
    if (query.status) where.status = query.status;

    const [data, total] = await Promise.all([
      this.prisma.document.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          filename: true,
          status: true,
          processingStage: true,
          fileSize: true,
          createdAt: true,
          user: { select: { id: true, name: true, email: true } },
        },
      }),
      this.prisma.document.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async deleteDocument(id: string) {
    const document = await this.prisma.document.findUnique({ where: { id } });
    if (!document) throw new NotFoundException('Document not found');

    await this.prisma.document.delete({ where: { id } });
    return { success: true };
  }

  async getAnalytics(days: number) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const [signups, uploads, generations] = await Promise.all([
      this.prisma.$queryRaw<Array<{ date: string; count: number }>>`
        SELECT DATE("createdAt")::text as date, COUNT(*)::int as count
        FROM users
        WHERE "createdAt" >= ${since}
        GROUP BY DATE("createdAt")
        ORDER BY date ASC
      `,
      this.prisma.$queryRaw<Array<{ date: string; count: number }>>`
        SELECT DATE("createdAt")::text as date, COUNT(*)::int as count
        FROM documents
        WHERE "createdAt" >= ${since}
        GROUP BY DATE("createdAt")
        ORDER BY date ASC
      `,
      this.prisma.$queryRaw<Array<{ date: string; count: number }>>`
        SELECT DATE("createdAt")::text as date, COUNT(*)::int as count
        FROM roadmaps
        WHERE "createdAt" >= ${since}
        GROUP BY DATE("createdAt")
        ORDER BY date ASC
      `,
    ]);

    return { signups, uploads, generations };
  }
}
