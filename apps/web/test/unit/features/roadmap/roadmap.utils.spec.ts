import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { RoadmapStep } from "@sagepoint/domain";
import {
  getStatus,
  formatDuration,
  formatRelativeTime,
  getDifficultyDistribution,
  groupRoadmapStepsForTimeline,
  isSubConceptStep,
  normalizeTopicInput,
  STATUS_CONFIG,
} from "@/features/roadmap/utils/roadmap.utils";

function makeStep(
  overrides: Partial<RoadmapStep> & { id: string; name: string },
): RoadmapStep {
  return {
    concept: {
      id: overrides.id,
      name: overrides.name,
      description: overrides.name,
    },
    order: overrides.order ?? 0,
    dependsOn: overrides.dependsOn ?? [],
    learningObjective: overrides.learningObjective,
    difficulty: overrides.difficulty,
    ...overrides,
  } as RoadmapStep;
}

describe("getStatus", () => {
  it("returns completed when progress is 100%", () => {
    const result = getStatus({
      progressPercentage: 100,
      completedSteps: 5,
      totalSteps: 5,
      inProgressSteps: 0,
      skippedSteps: 0,
      roadmapId: "r1",
      lastActivityAt: null,
    });
    expect(result).toBe(STATUS_CONFIG.completed);
  });

  it("returns inProgress when steps are in progress", () => {
    const result = getStatus({
      progressPercentage: 40,
      completedSteps: 2,
      totalSteps: 5,
      inProgressSteps: 1,
      skippedSteps: 0,
      roadmapId: "r1",
      lastActivityAt: null,
    });
    expect(result).toBe(STATUS_CONFIG.inProgress);
  });

  it("returns inProgress when steps are completed but not 100%", () => {
    const result = getStatus({
      progressPercentage: 60,
      completedSteps: 3,
      totalSteps: 5,
      inProgressSteps: 0,
      skippedSteps: 0,
      roadmapId: "r1",
      lastActivityAt: null,
    });
    expect(result).toBe(STATUS_CONFIG.inProgress);
  });

  it("returns new when no progress", () => {
    const result = getStatus({
      progressPercentage: 0,
      completedSteps: 0,
      totalSteps: 5,
      inProgressSteps: 0,
      skippedSteps: 0,
      roadmapId: "r1",
      lastActivityAt: null,
    });
    expect(result).toBe(STATUS_CONFIG.new);
  });
});

describe("formatDuration", () => {
  it.each([
    [undefined, "Flexible"],
    [0, "Flexible"],
    [30, "30m"],
    [60, "1h"],
    [90, "1h 30m"],
    [150, "2h 30m"],
    [120, "2h"],
  ])("formatDuration(%s) → %s", (input, expected) => {
    expect(formatDuration(input)).toBe(expected);
  });
});

describe("formatRelativeTime", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-16T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("formats minutes ago", () => {
    expect(formatRelativeTime("2026-03-16T11:45:00Z")).toBe("15m ago");
  });

  it("formats hours ago", () => {
    expect(formatRelativeTime("2026-03-16T09:00:00Z")).toBe("3h ago");
  });

  it("formats days ago", () => {
    expect(formatRelativeTime("2026-03-14T12:00:00Z")).toBe("2d ago");
  });

  it("formats months ago", () => {
    expect(formatRelativeTime("2025-12-16T12:00:00Z")).toBe("3mo ago");
  });
});

describe("getDifficultyDistribution", () => {
  it("counts steps by difficulty", () => {
    const steps = [
      { difficulty: "beginner" },
      { difficulty: "beginner" },
      { difficulty: "advanced" },
    ] as { difficulty: string }[];

    const result = getDifficultyDistribution(steps as never);
    expect(result).toEqual({ beginner: 2, advanced: 1 });
  });

  it("skips steps without difficulty", () => {
    const steps = [
      { difficulty: undefined },
      { difficulty: "beginner" },
    ] as never;
    const result = getDifficultyDistribution(steps);
    expect(result).toEqual({ beginner: 1 });
  });
});

describe("isSubConceptStep", () => {
  it("detects steps marked as sub-concepts", () => {
    expect(
      isSubConceptStep(
        makeStep({
          id: "react-hooks",
          name: "React Hooks",
          rationale: 'Sub-concept of "React"',
        }),
      ),
    ).toBe(true);
  });

  it("keeps regular dependent steps as top-level steps", () => {
    expect(
      isSubConceptStep(
        makeStep({
          id: "css",
          name: "CSS",
          dependsOn: ["html"],
        }),
      ),
    ).toBe(false);
  });
});

describe("groupRoadmapStepsForTimeline", () => {
  it("groups sub-concepts under each dependency and preserves top-level steps", () => {
    const html = makeStep({ id: "html", name: "HTML", order: 1 });
    const css = makeStep({
      id: "css",
      name: "CSS",
      order: 2,
      dependsOn: ["html"],
    });
    const flexbox = makeStep({
      id: "flexbox",
      name: "Flexbox",
      order: 3,
      dependsOn: ["css", "html"],
      rationale: 'Sub-concept of "CSS"',
    });

    const result = groupRoadmapStepsForTimeline([html, css, flexbox]);

    expect(result.topLevelSteps).toEqual([html, css]);
    expect(result.subConceptsByParent.get("css")).toEqual([flexbox]);
    expect(result.subConceptsByParent.get("html")).toEqual([flexbox]);
    expect(Array.from(result.expandedConceptIds)).toEqual(["css", "html"]);
  });
});

describe("normalizeTopicInput", () => {
  it("leaves a plain topic unchanged", () => {
    expect(normalizeTopicInput("React")).toBe("React");
  });

  it("strips a leading Learn prefix", () => {
    expect(normalizeTopicInput("Learn React")).toBe("React");
  });

  it("is case-insensitive", () => {
    expect(normalizeTopicInput("learn react")).toBe("react");
  });

  it("collapses repeated Learn prefixes with punctuation", () => {
    expect(normalizeTopicInput("Learn: Learn React")).toBe("React");
  });

  it("trims surrounding whitespace and internal gap after prefix", () => {
    expect(normalizeTopicInput("  Learn   React  ")).toBe("React");
  });

  it("falls back to original trimmed value when only Learn is typed", () => {
    expect(normalizeTopicInput("Learn")).toBe("Learn");
  });

  it("does not strip a Learn-prefixed word boundary like Learning", () => {
    expect(normalizeTopicInput("Learning React")).toBe("Learning React");
  });
});
