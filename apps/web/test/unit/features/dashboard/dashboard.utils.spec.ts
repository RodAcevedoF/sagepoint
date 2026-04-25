import { describe, it, expect } from "vitest";
import {
  computeMetrics,
  computeRoadmaps,
  computeRoadmapsOverview,
  computeInsights,
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
    lastActivityAt: null,
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
      generationStatus: "completed",
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
      completedRoadmaps: 0,
      activeRoadmaps: 0,
      totalStepsCompleted: 0,
      overallProgress: 0,
    });
  });

  it("pro-rates duration by completion ratio and converts minutes to hours", () => {
    const roadmap = makeDashboardRoadmap({
      roadmap: {
        steps: [
          makeStep({ estimatedDuration: 120 }),
          makeStep({ estimatedDuration: 60 }),
        ],
      },
      // 4/4 completed → 100% → all 180min count → 3h
      progress: { completedSteps: 4, totalSteps: 4, progressPercentage: 100 },
    });
    const result = computeMetrics([roadmap]);
    expect(result.totalHoursLearned).toBe(3);
  });

  it("counts active roadmaps (completed generation, not 100% progress)", () => {
    const active = makeDashboardRoadmap({
      progress: { completedSteps: 1, progressPercentage: 50 },
    });
    const finished = makeDashboardRoadmap({
      progress: { completedSteps: 4, totalSteps: 4, progressPercentage: 100 },
    });
    const pending = makeDashboardRoadmap({
      roadmap: { generationStatus: "pending" },
    });
    expect(computeMetrics([active, finished, pending]).activeRoadmaps).toBe(1);
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

describe("computeRoadmaps", () => {
  it("pins generating roadmap above completed ones", () => {
    const generating = makeDashboardRoadmap({
      roadmap: {
        id: "gen",
        title: "Generating",
        generationStatus: "pending",
        createdAt: "2025-01-01T00:00:00Z",
      },
    });
    const completed = makeDashboardRoadmap({
      roadmap: { id: "done", title: "Done", createdAt: "2026-03-01T00:00:00Z" },
    });
    const result = computeRoadmaps([completed, generating], 4);
    expect(result[0].id).toBe("gen");
    expect(result[1].id).toBe("done");
  });

  it("sorts completed roadmaps by lastActivityAt desc", () => {
    const older = makeDashboardRoadmap({
      roadmap: { id: "old", title: "Old", createdAt: "2025-01-01T00:00:00Z" },
      progress: { lastActivityAt: "2025-06-01T00:00:00Z" },
    });
    const newer = makeDashboardRoadmap({
      roadmap: { id: "new", title: "New", createdAt: "2025-01-01T00:00:00Z" },
      progress: { lastActivityAt: "2026-03-01T00:00:00Z" },
    });
    const result = computeRoadmaps([older, newer], 4);
    expect(result[0].id).toBe("new");
    expect(result[1].id).toBe("old");
  });

  it("falls back to createdAt when lastActivityAt is null", () => {
    const older = makeDashboardRoadmap({
      roadmap: { id: "old", title: "Old", createdAt: "2025-01-01T00:00:00Z" },
      progress: { lastActivityAt: null },
    });
    const newer = makeDashboardRoadmap({
      roadmap: { id: "new", title: "New", createdAt: "2026-03-01T00:00:00Z" },
      progress: { lastActivityAt: null },
    });
    const result = computeRoadmaps([older, newer], 4);
    expect(result[0].id).toBe("new");
  });

  it("respects limit", () => {
    const items = Array.from({ length: 6 }, (_, i) =>
      makeDashboardRoadmap({ roadmap: { id: `r${i}`, title: `R${i}` } }),
    );
    expect(computeRoadmaps(items, 4)).toHaveLength(4);
  });

  it("returns empty array for no roadmaps", () => {
    expect(computeRoadmaps([])).toEqual([]);
  });
});

describe("computeRoadmapsOverview", () => {
  it("counts in-progress roadmaps", () => {
    const active = makeDashboardRoadmap({
      progress: { completedSteps: 1, progressPercentage: 25 },
    });
    const result = computeRoadmapsOverview([active]);
    expect(result.inProgress).toBe(1);
    expect(result.completed).toBe(0);
    expect(result.justCreated).toBe(0);
  });

  it("counts completed roadmaps", () => {
    const done = makeDashboardRoadmap({
      progress: { completedSteps: 4, totalSteps: 4, progressPercentage: 100 },
    });
    const result = computeRoadmapsOverview([done]);
    expect(result.completed).toBe(1);
    expect(result.inProgress).toBe(0);
  });

  it("counts just-created (generating or 0% progress)", () => {
    const generating = makeDashboardRoadmap({
      roadmap: { generationStatus: "pending" },
      progress: { progressPercentage: 0 },
    });
    const fresh = makeDashboardRoadmap({
      progress: { completedSteps: 0, progressPercentage: 0 },
    });
    const result = computeRoadmapsOverview([generating, fresh]);
    expect(result.justCreated).toBe(2);
  });
});

describe("computeInsights", () => {
  it("groups steps by difficulty with correct counts", () => {
    const roadmap = makeDashboardRoadmap({
      roadmap: {
        steps: [
          makeStep({ difficulty: "beginner" }),
          makeStep({ difficulty: "beginner" }),
          makeStep({ difficulty: "advanced" }),
        ],
      },
    });
    const result = computeInsights([roadmap]);
    expect(result.difficultyBreakdown).toHaveLength(2);
    const beginner = result.difficultyBreakdown.find(
      (d) => d.name === "Beginner",
    );
    expect(beginner?.count).toBe(2);
  });

  it("returns zero totalSteps when no steps exist", () => {
    const roadmap = makeDashboardRoadmap({ roadmap: { steps: [] } });
    expect(computeInsights([roadmap]).totalSteps).toBe(0);
  });

  it("capitalizes difficulty names", () => {
    const roadmap = makeDashboardRoadmap({
      roadmap: { steps: [makeStep({ difficulty: "beginner" })] },
    });
    const result = computeInsights([roadmap]);
    expect(result.difficultyBreakdown[0].name).toBe("Beginner");
  });
});
