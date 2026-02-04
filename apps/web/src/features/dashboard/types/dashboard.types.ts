// ============================================================================
// Dashboard Types
// ============================================================================

export interface UserMetrics {
  totalHoursLearned: number;
  topicsCompleted: number;
  currentStreak: number;
  weeklyProgress: number; // percentage
}

export interface ProgressData {
  day: string;
  hours: number;
}

export interface RecentActivity {
  id: string;
  type: "topic" | "resource";
  title: string;
  category: string;
  timestamp: string;
  progress?: number;
}

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  category: string;
  timestamp: string;
  url: string;
}

export interface TopicDistribution {
  name: string;
  value: number;
  color: string;
}
