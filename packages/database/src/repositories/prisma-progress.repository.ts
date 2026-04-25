import {
  IProgressRepository,
  UserRoadmapProgress,
  RoadmapProgressSummary,
  ActivitySummary,
  StepStatus,
  type ICacheService,
} from "@sagepoint/domain";
import type {
  PrismaClient,
  UserRoadmapProgress as PrismaProgress,
} from "../generated/prisma/client";

interface SerializedStep {
  concept: { id: string };
}

const TTL_SECONDS = 600; // 10 minutes

export class PrismaProgressRepository implements IProgressRepository {
  constructor(
    private readonly prisma: PrismaClient,
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
        lastActivityAt: null,
      };
    }

    const [counts, lastCompleted] = await Promise.all([
      this.prisma.userRoadmapProgress.groupBy({
        by: ["status"],
        where: { userId, roadmapId },
        _count: { status: true },
      }),
      this.prisma.userRoadmapProgress.aggregate({
        _max: { completedAt: true },
        where: { userId, roadmapId, status: "COMPLETED" },
      }),
    ]);

    const statusCounts = counts.reduce<Record<string, number>>((acc, curr) => {
      acc[curr.status] = curr._count.status;
      return acc;
    }, {});

    const completedSteps = statusCounts["COMPLETED"] || 0;
    const inProgressSteps = statusCounts["IN_PROGRESS"] || 0;
    const skippedSteps = statusCounts["SKIPPED"] || 0;

    const summary: RoadmapProgressSummary = {
      roadmapId,
      totalSteps,
      completedSteps,
      inProgressSteps,
      skippedSteps,
      progressPercentage: Math.round((completedSteps / totalSteps) * 100),
      lastActivityAt: lastCompleted._max.completedAt?.toISOString() ?? null,
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
          select: { status: true, completedAt: true },
        },
      },
    });

    const summaries = roadmaps.map((roadmap) => {
      const steps = Array.isArray(roadmap.steps)
        ? (roadmap.steps as unknown as SerializedStep[])
        : [];
      const totalSteps = steps.length;

      let completedSteps = 0;
      let inProgressSteps = 0;
      let skippedSteps = 0;
      let maxCompletedAt: Date | null = null;

      for (const p of roadmap.progress) {
        if (p.status === "COMPLETED") {
          completedSteps++;
          if (
            p.completedAt &&
            (!maxCompletedAt || p.completedAt > maxCompletedAt)
          ) {
            maxCompletedAt = p.completedAt;
          }
        } else if (p.status === "IN_PROGRESS") {
          inProgressSteps++;
        } else if (p.status === "SKIPPED") {
          skippedSteps++;
        }
      }

      return {
        roadmapId: roadmap.id,
        totalSteps,
        completedSteps,
        inProgressSteps,
        skippedSteps,
        progressPercentage:
          totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0,
        lastActivityAt: maxCompletedAt ? maxCompletedAt.toISOString() : null,
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
      where: { userId, roadmapId, status: "COMPLETED" },
      select: { conceptId: true },
    });
    return completed.map((p) => p.conceptId);
  }

  async getActivitySummary(
    userId: string,
    days: number,
    timezone: string,
  ): Promise<ActivitySummary> {
    type Row = { result: ActivitySummary };
    const rows = await this.prisma.$queryRaw<Row[]>`
      WITH params AS (
        SELECT
          (NOW() AT TIME ZONE ${timezone})::date AS today,
          ${days}::int AS day_count
      ),
      date_series AS (
        SELECT generate_series(
          (SELECT today - (day_count - 1) FROM params),
          (SELECT today FROM params),
          '1 day'::interval
        )::date AS day
      ),
      activity AS (
        SELECT
          ("completedAt" AT TIME ZONE ${timezone})::date AS day,
          COUNT(*)::int AS cnt
        FROM user_roadmap_progress
        WHERE "userId" = ${userId}::uuid
          AND "completedAt" IS NOT NULL
          AND "completedAt" >= ((SELECT today - (day_count - 1) FROM params))::timestamp AT TIME ZONE ${timezone}
        GROUP BY 1
      ),
      days_full AS (
        SELECT ds.day, COALESCE(a.cnt, 0)::int AS cnt
        FROM date_series ds
        LEFT JOIN activity a ON a.day = ds.day
      ),
      active_days AS (
        SELECT day, ROW_NUMBER() OVER (ORDER BY day) AS rn
        FROM days_full
        WHERE cnt > 0
      ),
      streaks AS (
        SELECT
          (day - rn::int) AS grp,
          COUNT(*)::int  AS length,
          MAX(day)       AS end_day
        FROM active_days
        GROUP BY (day - rn::int)
      ),
      cur_streak AS (
        SELECT length
        FROM streaks
        WHERE end_day >= (SELECT today - 1 FROM params)
        ORDER BY end_day DESC
        LIMIT 1
      ),
      totals AS (
        SELECT
          COALESCE(SUM(CASE WHEN day >= (SELECT today - 6  FROM params) THEN cnt END), 0)::int AS total_last_7,
          COALESCE(SUM(CASE WHEN day >= (SELECT today - 29 FROM params) THEN cnt END), 0)::int AS total_last_30,
          COALESCE(SUM(CASE
              WHEN day >= (SELECT today - 59 FROM params)
                AND day <  (SELECT today - 29 FROM params) THEN cnt END), 0)::int AS total_prev_30
        FROM days_full
      )
      SELECT json_build_object(
        'days', (
          SELECT json_agg(
            json_build_object('date', TO_CHAR(day, 'YYYY-MM-DD'), 'count', cnt)
            ORDER BY day
          )
          FROM days_full
        ),
        'currentStreak', COALESCE((SELECT length FROM cur_streak), 0),
        'longestStreak', COALESCE((SELECT MAX(length) FROM streaks), 0),
        'totalLast7',  (SELECT total_last_7  FROM totals),
        'totalLast30', (SELECT total_last_30 FROM totals),
        'totalPrev30', (SELECT total_prev_30 FROM totals)
      ) AS result
    `;

    return (
      rows[0]?.result ?? {
        days: [],
        totalLast7: 0,
        totalLast30: 0,
        totalPrev30: 0,
        currentStreak: 0,
        longestStreak: 0,
      }
    );
  }

  async deleteByRoadmap(roadmapId: string): Promise<void> {
    await this.prisma.userRoadmapProgress.deleteMany({ where: { roadmapId } });
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
