import type { RoadmapStep, RoadmapProgressSummary } from "@sagepoint/domain";

// ============================================================================
// Dashboard Types
// ============================================================================

/** Presentation-layer input for dashboard computations (mirrors API shape) */
export interface DashboardRoadmap {
  roadmap: {
    id: string;
    title: string;
    generationStatus: string;
    steps: RoadmapStep[];
    createdAt: string;
    categoryName?: string;
  };
  progress: RoadmapProgressSummary;
}

export interface UserMetrics {
  totalHoursLearned: number;
  completedRoadmaps: number;
  activeRoadmaps: number;
  totalStepsCompleted: number;
  overallProgress: number;
}

export interface RoadmapItem {
  id: string;
  title: string;
  createdAt: string;
  lastActivityAt: string | null;
  generationStatus: string;
  progressPercentage: number;
  completedSteps: number;
  totalSteps: number;
  categoryName?: string;
}

export interface RoadmapsOverview {
  inProgress: number;
  completed: number;
  justCreated: number;
}

export interface DifficultySegment {
  name: string;
  count: number;
  color: string;
}

export interface InsightsData {
  difficultyBreakdown: DifficultySegment[];
  avgMinutesPerStep: number;
  hoursInvested: number;
  hoursRemaining: number;
  totalSteps: number;
}
