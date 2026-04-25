import type {
  DashboardRoadmap,
  UserMetrics,
  RoadmapItem,
  RoadmapsOverview,
  InsightsData,
} from "../types/dashboard.types";
import {
  FileText,
  FileSpreadsheet,
  FileImage,
  FileType,
  File,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { palette } from "@/shared/theme";

const DIFFICULTY_COLORS: Record<string, string> = palette.difficulty;

export function getMimeIcon(mimeType?: string): LucideIcon {
  if (!mimeType) return File;
  if (mimeType.includes("pdf")) return FileText;
  if (mimeType.includes("spreadsheet") || mimeType.includes("xlsx"))
    return FileSpreadsheet;
  if (mimeType.startsWith("image/")) return FileImage;
  if (mimeType.includes("word") || mimeType.includes("docx")) return FileType;
  return File;
}

export function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}

export function computeMetrics(roadmaps: DashboardRoadmap[]): UserMetrics {
  let learnedMinutes = 0;
  let completedRoadmaps = 0;
  let activeRoadmaps = 0;
  let totalStepsCompleted = 0;
  let totalPossibleSteps = 0;

  for (const { roadmap, progress } of roadmaps) {
    const roadmapMinutes = roadmap.steps.reduce(
      (sum, step) => sum + (step.estimatedDuration ?? 0),
      0,
    );
    if (progress.totalSteps > 0) {
      learnedMinutes +=
        roadmapMinutes * (progress.completedSteps / progress.totalSteps);
    }

    totalStepsCompleted += progress.completedSteps;
    totalPossibleSteps += progress.totalSteps;

    if (roadmap.generationStatus === "completed") {
      if (progress.progressPercentage >= 100) completedRoadmaps++;
      else activeRoadmaps++;
    }
  }

  const overallProgress =
    totalPossibleSteps > 0
      ? Math.round((totalStepsCompleted / totalPossibleSteps) * 100)
      : 0;

  return {
    totalHoursLearned: Math.round(learnedMinutes / 60),
    completedRoadmaps,
    activeRoadmaps,
    totalStepsCompleted,
    overallProgress,
  };
}

const roadmapStamp = (r: DashboardRoadmap) =>
  new Date(r.progress.lastActivityAt ?? r.roadmap.createdAt).getTime();

function smartSort(a: DashboardRoadmap, b: DashboardRoadmap): number {
  const aGen = a.roadmap.generationStatus !== "completed";
  const bGen = b.roadmap.generationStatus !== "completed";
  if (aGen !== bGen) return aGen ? -1 : 1;
  return roadmapStamp(b) - roadmapStamp(a);
}

export function computeRoadmaps(
  roadmaps: DashboardRoadmap[],
  limit = 4,
): RoadmapItem[] {
  return [...roadmaps]
    .sort(smartSort)
    .slice(0, limit)
    .map(({ roadmap, progress }) => ({
      id: roadmap.id,
      title: roadmap.title,
      createdAt: roadmap.createdAt,
      lastActivityAt: progress.lastActivityAt,
      generationStatus: roadmap.generationStatus,
      progressPercentage: progress.progressPercentage,
      completedSteps: progress.completedSteps,
      totalSteps: progress.totalSteps,
      categoryName: roadmap.categoryName,
    }));
}

export function computeRoadmapsOverview(
  roadmaps: DashboardRoadmap[],
): RoadmapsOverview {
  let inProgress = 0;
  let completed = 0;
  let justCreated = 0;

  for (const { roadmap, progress } of roadmaps) {
    if (progress.progressPercentage >= 100) {
      completed++;
    } else if (
      roadmap.generationStatus === "completed" &&
      progress.progressPercentage > 0
    ) {
      inProgress++;
    } else {
      justCreated++;
    }
  }

  return { inProgress, completed, justCreated };
}

export function computeInsights(roadmaps: DashboardRoadmap[]): InsightsData {
  const counts: Record<string, number> = {};
  let totalMinutes = 0;
  let remainingMinutes = 0;
  let totalSteps = 0;

  for (const { roadmap, progress } of roadmaps) {
    const completionRatio =
      progress.totalSteps > 0
        ? progress.completedSteps / progress.totalSteps
        : 0;

    for (const step of roadmap.steps) {
      const difficulty = step.difficulty ?? "unknown";
      counts[difficulty] = (counts[difficulty] ?? 0) + 1;
      totalSteps++;
      if (step.estimatedDuration) {
        totalMinutes += step.estimatedDuration;
        remainingMinutes += step.estimatedDuration * (1 - completionRatio);
      }
    }
  }

  const difficultyBreakdown = Object.entries(counts)
    .map(([name, count]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      count,
      color: DIFFICULTY_COLORS[name] ?? DIFFICULTY_COLORS.unknown,
    }))
    .sort((a, b) => b.count - a.count);

  return {
    difficultyBreakdown,
    avgMinutesPerStep:
      totalSteps > 0 ? Math.round(totalMinutes / totalSteps) : 0,
    hoursInvested: Math.round((totalMinutes - remainingMinutes) / 60),
    hoursRemaining: Math.round(remainingMinutes / 60),
    totalSteps,
  };
}

export interface CategoryCount {
  name: string;
  count: number;
}

export function computeCategoriesOverview(
  roadmaps: DashboardRoadmap[],
): CategoryCount[] {
  const counts: Record<string, number> = {};
  for (const { roadmap } of roadmaps) {
    if (!roadmap.categoryName) continue;
    counts[roadmap.categoryName] = (counts[roadmap.categoryName] ?? 0) + 1;
  }
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}
