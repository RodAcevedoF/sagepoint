// ============================================================================
// Dashboard Types
// ============================================================================

export interface UserMetrics {
  totalHoursLearned: number;
  topicsCompleted: number;
  activeRoadmaps: number;
  totalStepsCompleted: number;
}

export interface RoadmapProgressItem {
  id: string;
  title: string;
  progressPercentage: number;
  completedSteps: number;
  totalSteps: number;
}

export interface TopicDistribution {
  name: string;
  value: number;
  color: string;
}
