import type {
	DashboardRoadmap,
	UserMetrics,
	RoadmapProgressItem,
	RecentRoadmapItem,
	TopicDistribution,
} from '../types/dashboard.types';
import { palette } from '@/common/theme';

const DIFFICULTY_COLORS: Record<string, string> = palette.difficulty;

export function computeMetrics(roadmaps: DashboardRoadmap[]): UserMetrics {
	let totalHoursLearned = 0;
	let topicsCompleted = 0;
	let activeRoadmaps = 0;
	let totalStepsCompleted = 0;
	let totalPossibleSteps = 0;

	for (const { roadmap, progress } of roadmaps) {
		for (const step of roadmap.steps) {
			if (step.estimatedDuration) {
				totalHoursLearned += step.estimatedDuration;
			}
		}

		totalStepsCompleted += progress.completedSteps;
		totalPossibleSteps += progress.totalSteps;
		topicsCompleted += progress.completedSteps;

		if (progress.inProgressSteps > 0 || progress.completedSteps > 0) {
			activeRoadmaps++;
		}
	}

	const overallProgress =
		totalPossibleSteps > 0 ?
			Math.round((totalStepsCompleted / totalPossibleSteps) * 100)
		:	0;

	return {
		totalHoursLearned: Math.round(totalHoursLearned / 60),
		topicsCompleted,
		activeRoadmaps,
		totalStepsCompleted,
		overallProgress,
	};
}

export function computeRoadmapProgress(
	roadmaps: DashboardRoadmap[],
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

export function computeRecentRoadmaps(
	roadmaps: DashboardRoadmap[],
	limit = 3,
): RecentRoadmapItem[] {
	return [...roadmaps]
		.sort(
			(a, b) =>
				new Date(b.roadmap.createdAt).getTime() -
				new Date(a.roadmap.createdAt).getTime(),
		)
		.slice(0, limit)
		.map(({ roadmap, progress }) => ({
			id: roadmap.id,
			title: roadmap.title,
			createdAt: roadmap.createdAt,
			progressPercentage: progress.progressPercentage,
			completedSteps: progress.completedSteps,
			totalSteps: progress.totalSteps,
		}));
}

export function computeDifficultyDistribution(
	roadmaps: DashboardRoadmap[],
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
