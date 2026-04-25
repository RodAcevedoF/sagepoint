import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { DashboardMetrics } from "@/features/dashboard/components/DashboardMetrics";
import type { UserMetrics } from "@/features/dashboard/types/dashboard.types";

const metrics: UserMetrics = {
  totalHoursLearned: 42,
  completedRoadmaps: 5,
  activeRoadmaps: 3,
  totalStepsCompleted: 28,
  overallProgress: 65,
};

describe("DashboardMetrics", () => {
  it("renders all four metric cards", () => {
    render(<DashboardMetrics metrics={metrics} />);

    expect(screen.getByText("42h")).toBeInTheDocument();
    expect(screen.getByText("Learning Hours")).toBeInTheDocument();

    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("Roadmaps Completed")).toBeInTheDocument();

    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("Active Roadmaps")).toBeInTheDocument();

    expect(screen.getByText("28")).toBeInTheDocument();
    expect(screen.getByText("Steps Completed")).toBeInTheDocument();
  });

  it("renders zero values correctly", () => {
    const zeroMetrics: UserMetrics = {
      totalHoursLearned: 0,
      completedRoadmaps: 0,
      activeRoadmaps: 0,
      totalStepsCompleted: 0,
      overallProgress: 0,
    };
    render(<DashboardMetrics metrics={zeroMetrics} />);
    expect(screen.getByText("0h")).toBeInTheDocument();
    const zeros = screen.getAllByText("0");
    expect(zeros).toHaveLength(3);
  });
});
