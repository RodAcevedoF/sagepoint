import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { DashboardMetrics } from "@/features/dashboard/components/DashboardMetrics";
import type { UserMetrics } from "@/features/dashboard/types/dashboard.types";

const metrics: UserMetrics = {
  totalHoursLearned: 42,
  topicsCompleted: 15,
  activeRoadmaps: 3,
  totalStepsCompleted: 28,
  overallProgress: 65,
};

describe("DashboardMetrics", () => {
  it("renders all four metric cards", () => {
    render(<DashboardMetrics metrics={metrics} />);

    expect(screen.getByText("42h")).toBeInTheDocument();
    expect(screen.getByText("Hours Learned")).toBeInTheDocument();

    expect(screen.getByText("15")).toBeInTheDocument();
    expect(screen.getByText("Topics Completed")).toBeInTheDocument();

    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("Active Roadmaps")).toBeInTheDocument();

    expect(screen.getByText("28")).toBeInTheDocument();
    expect(screen.getByText("Steps Completed")).toBeInTheDocument();
  });

  it("renders zero values correctly", () => {
    const zeroMetrics: UserMetrics = {
      totalHoursLearned: 0,
      topicsCompleted: 0,
      activeRoadmaps: 0,
      totalStepsCompleted: 0,
      overallProgress: 0,
    };
    render(<DashboardMetrics metrics={zeroMetrics} />);
    expect(screen.getByText("0h")).toBeInTheDocument();
    // All zeros
    const zeros = screen.getAllByText("0");
    expect(zeros).toHaveLength(3);
  });
});
