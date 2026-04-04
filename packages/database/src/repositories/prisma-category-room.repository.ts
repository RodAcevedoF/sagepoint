import {
  Roadmap,
  Concept,
  RoadmapVisibility,
  type RoadmapGenerationStatus,
  type RoadmapStep,
  type ICategoryRoomRepository,
  type CategoryRoomStats,
} from "@sagepoint/domain";
import type {
  PrismaClient,
  Roadmap as PrismaRoadmap,
  RoadmapGenerationStatus as PrismaGenStatus,
  RoadmapVisibility as PrismaVisibility,
} from "../generated/prisma/client";

interface SerializedStep {
  concept: {
    id: string;
    name: string;
    documentId?: string;
    description?: string;
  };
  order: number;
  dependsOn?: string[];
  learningObjective?: string;
  estimatedDuration?: number;
  difficulty?: "beginner" | "intermediate" | "advanced" | "expert";
  rationale?: string;
}

interface RawRoomStats {
  categoryId: string;
  roadmapCount: bigint;
  memberCount: bigint;
}

export class PrismaCategoryRoomRepository implements ICategoryRoomRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async listRoomStats(): Promise<CategoryRoomStats[]> {
    const rows = await this.prisma.$queryRaw<RawRoomStats[]>`
      SELECT
        "categoryId",
        COUNT(*)::bigint AS "roadmapCount",
        COUNT(DISTINCT "userId")::bigint AS "memberCount"
      FROM roadmaps
      WHERE visibility = 'PUBLIC'
        AND "generationStatus" = 'COMPLETED'
        AND "categoryId" IS NOT NULL
      GROUP BY "categoryId"
    `;
    return rows.map((r) => ({
      categoryId: r.categoryId,
      roadmapCount: Number(r.roadmapCount),
      memberCount: Number(r.memberCount),
    }));
  }

  async getRoomStats(categoryId: string): Promise<CategoryRoomStats | null> {
    const rows = await this.prisma.$queryRaw<RawRoomStats[]>`
      SELECT
        "categoryId",
        COUNT(*)::bigint AS "roadmapCount",
        COUNT(DISTINCT "userId")::bigint AS "memberCount"
      FROM roadmaps
      WHERE visibility = 'PUBLIC'
        AND "generationStatus" = 'COMPLETED'
        AND "categoryId" = ${categoryId}
      GROUP BY "categoryId"
    `;
    if (rows.length === 0) return null;
    return {
      categoryId: rows[0].categoryId,
      roadmapCount: Number(rows[0].roadmapCount),
      memberCount: Number(rows[0].memberCount),
    };
  }

  async findPublicRoadmapsByCategorySlug(
    slug: string,
    options: { search?: string; page: number; pageSize: number },
  ): Promise<{ items: Roadmap[]; total: number }> {
    const where = {
      category: { slug },
      visibility: "PUBLIC" as PrismaVisibility,
      generationStatus: "COMPLETED" as PrismaGenStatus,
      ...(options.search && {
        OR: [
          { title: { contains: options.search, mode: "insensitive" as const } },
          {
            description: {
              contains: options.search,
              mode: "insensitive" as const,
            },
          },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.roadmap.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (options.page - 1) * options.pageSize,
        take: options.pageSize,
      }),
      this.prisma.roadmap.count({ where }),
    ]);

    return {
      items: data.map((r) => this.mapToDomain(r)),
      total,
    };
  }

  // ── Mapping (duplicated from PrismaRoadmapRepository — pragmatic for isolation) ──

  private mapToDomain(data: PrismaRoadmap): Roadmap {
    return new Roadmap({
      id: data.id,
      title: data.title,
      documentId: data.documentId || undefined,
      userId: data.userId,
      categoryId: data.categoryId || undefined,
      description: data.description || undefined,
      steps: this.deserializeSteps(data.steps),
      generationStatus:
        data.generationStatus.toLowerCase() as RoadmapGenerationStatus,
      totalEstimatedDuration: data.totalDuration || undefined,
      recommendedPace: data.recommendedPace || undefined,
      errorMessage: data.errorMessage || undefined,
      isFeatured: data.isFeatured,
      visibility:
        data.visibility === "PUBLIC"
          ? RoadmapVisibility.PUBLIC
          : RoadmapVisibility.PRIVATE,
      createdAt: data.createdAt,
    });
  }

  private deserializeSteps(json: PrismaRoadmap["steps"]): RoadmapStep[] {
    if (!Array.isArray(json)) return [];
    const steps = json as unknown as SerializedStep[];
    return steps.map((raw) => ({
      concept: new Concept(
        raw.concept.id,
        raw.concept.name,
        raw.concept.documentId,
        raw.concept.description,
      ),
      order: raw.order,
      dependsOn: raw.dependsOn || [],
      learningObjective: raw.learningObjective,
      estimatedDuration: raw.estimatedDuration,
      difficulty: raw.difficulty,
      rationale: raw.rationale,
    }));
  }
}
