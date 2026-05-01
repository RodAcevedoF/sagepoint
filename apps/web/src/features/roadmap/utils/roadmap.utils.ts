import type { RoadmapStep } from "@sagepoint/domain";
import { UserRoadmapDto } from "@/infrastructure/api/roadmapApi";
import { palette } from "@/shared/theme";

interface GroupedRoadmapSteps {
  topLevelSteps: RoadmapStep[];
  subConceptsByParent: Map<string, RoadmapStep[]>;
  expandedConceptIds: Set<string>;
}

export function getStatus(progress: UserRoadmapDto["progress"]) {
  if (progress.progressPercentage === 100) return STATUS_CONFIG.completed;
  if (progress.inProgressSteps > 0 || progress.completedSteps > 0)
    return STATUS_CONFIG.inProgress;
  return STATUS_CONFIG.new;
}

export function isSubConceptStep(step: RoadmapStep): boolean {
  return step.rationale?.startsWith("Sub-concept of") ?? false;
}

export function groupRoadmapStepsForTimeline(
  steps: RoadmapStep[],
): GroupedRoadmapSteps {
  const topLevelSteps: RoadmapStep[] = [];
  const subConceptsByParent = new Map<string, RoadmapStep[]>();
  const expandedConceptIds = new Set<string>();

  for (const step of steps) {
    if (!isSubConceptStep(step)) {
      topLevelSteps.push(step);
      continue;
    }

    for (const dependencyId of step.dependsOn) {
      expandedConceptIds.add(dependencyId);

      const existingGroup = subConceptsByParent.get(dependencyId);
      if (existingGroup) {
        existingGroup.push(step);
        continue;
      }

      subConceptsByParent.set(dependencyId, [step]);
    }
  }

  return {
    topLevelSteps,
    subConceptsByParent,
    expandedConceptIds,
  };
}

export function formatDuration(minutes?: number): string {
  if (!minutes) return "Flexible";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export function getDifficultyDistribution(
  steps: UserRoadmapDto["roadmap"]["steps"],
) {
  const counts: Record<string, number> = {};
  for (const step of steps) {
    if (step.difficulty) {
      counts[step.difficulty] = (counts[step.difficulty] || 0) + 1;
    }
  }
  return counts;
}

export const STATUS_CONFIG = {
  completed: { label: "Completed", color: palette.success.light },
  inProgress: { label: "In Progress", color: palette.warning.light },
  new: { label: "New", color: palette.primary.light },
} as const;

export const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: palette.success.light,
  intermediate: palette.warning.light,
  advanced: palette.error.light,
};
