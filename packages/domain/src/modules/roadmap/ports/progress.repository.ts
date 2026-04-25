import {
  UserRoadmapProgress,
  RoadmapProgressSummary,
} from "../entities/progress.entity";

export interface ActivityDay {
  date: string; // YYYY-MM-DD
  count: number;
}

export interface ActivitySummary {
  days: ActivityDay[];
  totalLast7: number;
  totalLast30: number;
  totalPrev30: number;
  currentStreak: number;
  longestStreak: number;
}

export const PROGRESS_REPOSITORY = Symbol("PROGRESS_REPOSITORY");

export interface IProgressRepository {
  // Single operations
  upsert(progress: UserRoadmapProgress): Promise<UserRoadmapProgress>;

  findByUserAndRoadmap(
    userId: string,
    roadmapId: string,
  ): Promise<UserRoadmapProgress[]>;

  findByUserRoadmapAndConcept(
    userId: string,
    roadmapId: string,
    conceptId: string,
  ): Promise<UserRoadmapProgress | null>;

  // Batch operations for performance
  upsertMany(
    progressList: UserRoadmapProgress[],
  ): Promise<UserRoadmapProgress[]>;

  // Efficient aggregation queries
  getProgressSummary(
    userId: string,
    roadmapId: string,
  ): Promise<RoadmapProgressSummary | null>;

  getProgressSummariesForUser(
    userId: string,
  ): Promise<RoadmapProgressSummary[]>;

  // Bulk status check (avoids N+1)
  getCompletedConceptIds(userId: string, roadmapId: string): Promise<string[]>;

  // Activity heatmap — full aggregation (days, totals, streaks) computed in DB
  getActivitySummary(
    userId: string,
    days: number,
    timezone: string,
  ): Promise<ActivitySummary>;

  // Delete operations
  deleteByRoadmap(roadmapId: string): Promise<void>;
  deleteByUserAndRoadmap(userId: string, roadmapId: string): Promise<void>;
}
