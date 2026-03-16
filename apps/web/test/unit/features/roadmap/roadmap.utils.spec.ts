import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getStatus,
  formatDuration,
  formatRelativeTime,
  getDifficultyDistribution,
  STATUS_CONFIG,
} from "@/features/roadmap/utils/roadmap.utils";

describe("getStatus", () => {
  it("returns completed when progress is 100%", () => {
    const result = getStatus({
      progressPercentage: 100,
      completedSteps: 5,
      totalSteps: 5,
      inProgressSteps: 0,
      skippedSteps: 0,
      roadmapId: "r1",
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
