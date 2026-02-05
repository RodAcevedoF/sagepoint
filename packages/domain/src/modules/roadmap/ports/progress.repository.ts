import { UserRoadmapProgress, RoadmapProgressSummary, StepStatus } from '../entities/progress.entity';

export const PROGRESS_REPOSITORY = Symbol('PROGRESS_REPOSITORY');

export interface IProgressRepository {
  // Single operations
  upsert(progress: UserRoadmapProgress): Promise<UserRoadmapProgress>;

  findByUserAndRoadmap(userId: string, roadmapId: string): Promise<UserRoadmapProgress[]>;

  findByUserRoadmapAndConcept(
    userId: string,
    roadmapId: string,
    conceptId: string
  ): Promise<UserRoadmapProgress | null>;

  // Batch operations for performance
  upsertMany(progressList: UserRoadmapProgress[]): Promise<UserRoadmapProgress[]>;

  // Efficient aggregation queries
  getProgressSummary(userId: string, roadmapId: string): Promise<RoadmapProgressSummary | null>;

  getProgressSummariesForUser(userId: string): Promise<RoadmapProgressSummary[]>;

  // Bulk status check (avoids N+1)
  getCompletedConceptIds(userId: string, roadmapId: string): Promise<string[]>;

  // Delete operations
  deleteByRoadmap(roadmapId: string): Promise<void>;
  deleteByUserAndRoadmap(userId: string, roadmapId: string): Promise<void>;
}
