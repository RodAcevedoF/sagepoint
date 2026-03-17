import { describe, it, expect } from "vitest";
import {
  computeMetrics,
  computeRoadmapProgress,
  computeRecentRoadmaps,
  computeDifficultyDistribution,
} from "@/features/dashboard/utils/dashboard.utils";
import type { DashboardRoadmap } from "@/features/dashboard/types/dashboard.types";

function makeStep(overrides: Record<string, unknown> = {}) {
  return {
    concept: { id: "c1", name: "Test", description: "" },
    order: 1,
    dependsOn: [],
    estimatedDuration: 60,
    difficulty: "beginner" as const,
    ...overrides,
  };
}

function makeProgress(overrides: Record<string, unknown> = {}) {
  return {
    roadmapId: "r1",
    totalSteps: 4,
    completedSteps: 2,
    inProgressSteps: 1,
    skippedSteps: 0,
    progressPercentage: 50,
    ...overrides,
  };
}

function makeDashboardRoadmap(
  overrides: Partial<{
    roadmap: Partial<DashboardRoadmap["roadmap"]>;
    progress: Partial<DashboardRoadmap["progress"]>;
  }> = {},
): DashboardRoadmap {
  return {
    roadmap: {
      id: "r1",
      title: "Test Roadmap",
      steps: [makeStep()],
      createdAt: "2026-01-15T00:00:00Z",
      ...overrides.roadmap,
    },
    progress: makeProgress(overrides.progress),
  };
}

describe("computeMetrics", () => {
  it("returns zeroed metrics for empty input", () => {
    const result = computeMetrics([]);
    expect(result).toEqual({
      totalHoursLearned: 0,
      topicsCompleted: 0,
      activeRoadmaps: 0,
      totalStepsCompleted: 0,
      overallProgress: 0,
    });
  });

  it("sums duration across steps and converts minutes to hours", () => {
    const roadmap = makeDashboardRoadmap({
      roadmap: {
        steps: [
          makeStep({ estimatedDuration: 120 }),
          makeStep({ estimatedDuration: 60 }),
        ],
      },
    });
    const result = computeMetrics([roadmap]);
    expect(result.totalHoursLearned).toBe(3);
  });

  it("counts active roadmaps when progress exists", () => {
    const active = makeDashboardRoadmap({
      progress: { completedSteps: 1, inProgressSteps: 0 },
    });
    const inactive = makeDashboardRoadmap({
      progress: { completedSteps: 0, inProgressSteps: 0 },
    });
    expect(computeMetrics([active, inactive]).activeRoadmaps).toBe(1);
  });

  it("computes overall progress as percentage", () => {
    const r1 = makeDashboardRoadmap({
      progress: { completedSteps: 2, totalSteps: 4 },
    });
    const r2 = makeDashboardRoadmap({
      progress: { completedSteps: 3, totalSteps: 6 },
    });
    // 5/10 = 50%
    expect(computeMetrics([r1, r2]).overallProgress).toBe(50);
  });

  it("handles steps with no estimatedDuration", () => {
    const roadmap = makeDashboardRoadmap({
      roadmap: { steps: [makeStep({ estimatedDuration: undefined })] },
    });
    expect(computeMetrics([roadmap]).totalHoursLearned).toBe(0);
  });
});

describe("computeRoadmapProgress", () => {
  it("sorts by progress descending and respects limit", () => {
    const items = [
      makeDashboardRoadmap({
        roadmap: { id: "a", title: "A" },
        progress: { progressPercentage: 20 },
      }),
      makeDashboardRoadmap({
        roadmap: { id: "b", title: "B" },
        progress: { progressPercentage: 80 },
      }),
      makeDashboardRoadmap({
        roadmap: { id: "c", title: "C" },
        progress: { progressPercentage: 50 },
      }),
    ];
    const result = computeRoadmapProgress(items, 2);
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe("b");
    expect(result[1].id).toBe("c");
  });

  it("returns empty array for no roadmaps", () => {
    expect(computeRoadmapProgress([])).toEqual([]);
  });
});

describe("computeRecentRoadmaps", () => {
  it("sorts by creation date descending", () => {
    const items = [
      makeDashboardRoadmap({
        roadmap: { id: "old", title: "Old", createdAt: "2025-01-01T00:00:00Z" },
      }),
      makeDashboardRoadmap({
        roadmap: { id: "new", title: "New", createdAt: "2026-03-01T00:00:00Z" },
      }),
    ];
    const result = computeRecentRoadmaps(items, 2);
    expect(result[0].id).toBe("new");
    expect(result[1].id).toBe("old");
  });

  it("limits results", () => {
    const items = Array.from({ length: 5 }, (_, i) =>
      makeDashboardRoadmap({
        roadmap: {
          id: `r${i}`,
          title: `R${i}`,
          createdAt: `2026-0${i + 1}-01T00:00:00Z`,
        },
      }),
    );
    expect(computeRecentRoadmaps(items, 2)).toHaveLength(2);
  });
});

describe("computeDifficultyDistribution", () => {
  it("computes percentage distribution grouped by difficulty", () => {
    const roadmap = makeDashboardRoadmap({
      roadmap: {
        steps: [
          makeStep({ difficulty: "beginner" }),
          makeStep({ difficulty: "beginner" }),
          makeStep({ difficulty: "advanced" }),
          makeStep({ difficulty: "advanced" }),
        ],
      },
    });
    const result = computeDifficultyDistribution([roadmap]);
    expect(result).toHaveLength(2);
    expect(result.every((d) => d.value === 50)).toBe(true);
  });

  it("returns empty array when no steps exist", () => {
    const roadmap = makeDashboardRoadmap({ roadmap: { steps: [] } });
    expect(computeDifficultyDistribution([roadmap])).toEqual([]);
  });

  it("capitalizes difficulty names", () => {
    const roadmap = makeDashboardRoadmap({
      roadmap: { steps: [makeStep({ difficulty: "beginner" })] },
    });
    const result = computeDifficultyDistribution([roadmap]);
    expect(result[0].name).toBe("Beginner");
  });
});
