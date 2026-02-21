import type { RoadmapStep, RoadmapProgressSummary } from '@sagepoint/domain';

// ============================================================================
// Dashboard Types
// ============================================================================

/** Presentation-layer input for dashboard computations (mirrors API shape) */
export interface DashboardRoadmap {
	roadmap: {
		id: string;
		title: string;
		steps: RoadmapStep[];
		createdAt: string;
	};
	progress: RoadmapProgressSummary;
}

export interface UserMetrics {
	totalHoursLearned: number;
	topicsCompleted: number;
	activeRoadmaps: number;
	totalStepsCompleted: number;
	overallProgress: number;
}

export interface RoadmapProgressItem {
	id: string;
	title: string;
	progressPercentage: number;
	completedSteps: number;
	totalSteps: number;
}

export interface RecentRoadmapItem {
	id: string;
	title: string;
	createdAt: string;
	progressPercentage: number;
	completedSteps: number;
	totalSteps: number;
}

export interface TopicDistribution {
	name: string;
	value: number;
	color: string;
}
