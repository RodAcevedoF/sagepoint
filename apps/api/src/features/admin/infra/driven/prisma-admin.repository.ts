import { Prisma, type PrismaClient } from '@sagepoint/database';
import type {
  IAdminRepository,
  AdminUserView,
  AdminRoadmapView,
  AdminDocumentView,
  DailyCount,
} from '../../domain/outbound/admin.repository.port';

const USER_SELECT = {
  id: true,
  email: true,
  name: true,
  role: true,
  isActive: true,
  isVerified: true,
  createdAt: true,
  onboardingStatus: true,
} as const;

export class PrismaAdminRepository implements IAdminRepository {
  constructor(private readonly prisma: PrismaClient) {}

  // --- Stats ---

  async countUsers(): Promise<number> {
    return this.prisma.user.count();
  }

  async countDocuments(): Promise<number> {
    return this.prisma.document.count();
  }

  async countRoadmaps(): Promise<number> {
    return this.prisma.roadmap.count();
  }

  async countQuizzes(): Promise<number> {
    return this.prisma.quiz.count();
  }

  async getDocumentCountsByStage(): Promise<Record<string, number>> {
    const groups = await this.prisma.document.groupBy({
      by: ['processingStage'],
      _count: { id: true },
    });

    const stageMap: Record<string, number> = {};
    for (const group of groups) {
      stageMap[group.processingStage] = group._count.id;
    }
    return stageMap;
  }

  // --- Users ---

  async findAllUsers(): Promise<AdminUserView[]> {
    return this.prisma.user.findMany({
      select: USER_SELECT,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findUserById(id: string): Promise<AdminUserView | null> {
    return this.prisma.user.findUnique({
      where: { id },
      select: USER_SELECT,
    });
  }

  async updateUser(
    id: string,
    data: { role?: string; isActive?: boolean },
  ): Promise<AdminUserView> {
    const updateData: Prisma.UserUpdateInput = {};
    if (data.role !== undefined)
      updateData.role = data.role as 'ADMIN' | 'USER';
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    return this.prisma.user.update({
      where: { id },
      data: updateData,
      select: USER_SELECT,
    });
  }

  async deleteUser(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }

  // --- Roadmaps ---

  async findRoadmaps(query: {
    status?: string;
    categoryId?: string;
    skip: number;
    take: number;
  }): Promise<{ data: AdminRoadmapView[]; total: number }> {
    const where: Prisma.RoadmapWhereInput = {};
    if (query.status)
      where.generationStatus =
        query.status as Prisma.EnumRoadmapGenerationStatusFilter['equals'];
    if (query.categoryId) where.categoryId = query.categoryId;

    const [data, total] = await Promise.all([
      this.prisma.roadmap.findMany({
        where,
        skip: query.skip,
        take: query.take,
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

    return { data, total };
  }

  async findRoadmapById(
    id: string,
  ): Promise<{ id: string; isFeatured: boolean } | null> {
    return this.prisma.roadmap.findUnique({
      where: { id },
      select: { id: true, isFeatured: true },
    });
  }

  async deleteRoadmap(id: string): Promise<void> {
    await this.prisma.roadmap.delete({ where: { id } });
  }

  async updateRoadmapFeatured(
    id: string,
    isFeatured: boolean,
  ): Promise<{ id: string; isFeatured: boolean }> {
    return this.prisma.roadmap.update({
      where: { id },
      data: { isFeatured },
      select: { id: true, isFeatured: true },
    });
  }

  // --- Documents ---

  async findDocuments(query: {
    stage?: string;
    status?: string;
    skip: number;
    take: number;
  }): Promise<{ data: AdminDocumentView[]; total: number }> {
    const where: Prisma.DocumentWhereInput = {};
    if (query.stage)
      where.processingStage =
        query.stage as Prisma.EnumProcessingStageFilter['equals'];
    if (query.status) where.status = query.status;

    const [data, total] = await Promise.all([
      this.prisma.document.findMany({
        where,
        skip: query.skip,
        take: query.take,
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

    return { data, total };
  }

  async documentExists(id: string): Promise<boolean> {
    const doc = await this.prisma.document.findUnique({
      where: { id },
      select: { id: true },
    });
    return doc !== null;
  }

  async deleteDocument(id: string): Promise<void> {
    await this.prisma.document.delete({ where: { id } });
  }

  // --- Analytics ---

  async getSignupsByDay(since: Date): Promise<DailyCount[]> {
    return this.prisma.$queryRaw<DailyCount[]>`
      SELECT DATE("createdAt")::text as date, COUNT(*)::int as count
      FROM users
      WHERE "createdAt" >= ${since}
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `;
  }

  async getUploadsByDay(since: Date): Promise<DailyCount[]> {
    return this.prisma.$queryRaw<DailyCount[]>`
      SELECT DATE("createdAt")::text as date, COUNT(*)::int as count
      FROM documents
      WHERE "createdAt" >= ${since}
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `;
  }

  async getGenerationsByDay(since: Date): Promise<DailyCount[]> {
    return this.prisma.$queryRaw<DailyCount[]>`
      SELECT DATE("createdAt")::text as date, COUNT(*)::int as count
      FROM roadmaps
      WHERE "createdAt" >= ${since}
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `;
  }
}
