import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { DashboardGreeting } from "@/features/dashboard/components/DashboardGreeting";

const baseMetrics = {
  completedRoadmaps: 5,
  activeRoadmaps: 3,
  totalStepsCompleted: 12,
};

describe("DashboardGreeting", () => {
  it("renders welcome with the user's first name", () => {
    render(
      <DashboardGreeting userName="Maria Garcia Lopez" metrics={baseMetrics} />,
    );
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Welcome back, Maria",
    );
    expect(screen.queryByText(/garcia/i)).not.toBeInTheDocument();
  });

  it("shows steps-completed lede when stepsCompleted > 0", () => {
    render(<DashboardGreeting userName="Alice" metrics={baseMetrics} />);
    expect(screen.getByText(/completed 12 steps/i)).toBeInTheDocument();
  });

  it("shows default lede when no steps completed", () => {
    render(
      <DashboardGreeting
        userName="Alice"
        metrics={{ ...baseMetrics, totalStepsCompleted: 0 }}
      />,
    );
    expect(screen.getByText(/ready to continue/i)).toBeInTheDocument();
  });

  it("renders all three embedded stat values", () => {
    render(<DashboardGreeting userName="Alice" metrics={baseMetrics} />);
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("Completed")).toBeInTheDocument();
    expect(screen.getByText("Active paths")).toBeInTheDocument();
    expect(screen.getByText("Steps")).toBeInTheDocument();
  });
});
