import type { UserRoadmapDto } from '@/infrastructure/api/roadmapApi';
import type {
  UserMetrics,
  RoadmapProgressItem,
  TopicDistribution,
} from '../types/dashboard.types';

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: '#35A29F',
  intermediate: '#0B666A',
  advanced: '#97FEED',
  expert: '#071952',
  unknown: '#4a5568',
};

export function computeMetrics(roadmaps: UserRoadmapDto[]): UserMetrics {
  let totalHoursLearned = 0;
  let topicsCompleted = 0;
  let activeRoadmaps = 0;
  let totalStepsCompleted = 0;

  for (const { roadmap, progress } of roadmaps) {
    // Sum estimated durations from completed steps (convert minutes to hours)
    for (const step of roadmap.steps) {
      if (step.estimatedDuration) {
        totalHoursLearned += step.estimatedDuration;
      }
    }

    totalStepsCompleted += progress.completedSteps;
    topicsCompleted += progress.completedSteps;

    if (progress.inProgressSteps > 0 || progress.completedSteps > 0) {
      activeRoadmaps++;
    }
  }

  return {
    totalHoursLearned: Math.round(totalHoursLearned / 60),
    topicsCompleted,
    activeRoadmaps,
    totalStepsCompleted,
  };
}

export function computeRoadmapProgress(
  roadmaps: UserRoadmapDto[],
  limit = 5,
): RoadmapProgressItem[] {
  return roadmaps
    .map(({ roadmap, progress }) => ({
      id: roadmap.id,
      title: roadmap.title,
      progressPercentage: progress.progressPercentage,
      completedSteps: progress.completedSteps,
      totalSteps: progress.totalSteps,
    }))
    .sort((a, b) => b.progressPercentage - a.progressPercentage)
    .slice(0, limit);
}

export function computeDifficultyDistribution(
  roadmaps: UserRoadmapDto[],
): TopicDistribution[] {
  const counts: Record<string, number> = {};

  for (const { roadmap } of roadmaps) {
    for (const step of roadmap.steps) {
      const difficulty = step.difficulty ?? 'unknown';
      counts[difficulty] = (counts[difficulty] ?? 0) + 1;
    }
  }

  const total = Object.values(counts).reduce((sum, v) => sum + v, 0);
  if (total === 0) return [];

  return Object.entries(counts)
    .map(([name, count]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value: Math.round((count / total) * 100),
      color: DIFFICULTY_COLORS[name] ?? DIFFICULTY_COLORS.unknown,
    }))
    .sort((a, b) => b.value - a.value);
}
