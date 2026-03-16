import "@test/_helpers/next-mocks";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import { DashboardProgress } from "@/features/dashboard/components/DashboardProgress";
import { mockRouter } from "@test/_helpers/next-mocks";
import type { RoadmapProgressItem } from "@/features/dashboard/types/dashboard.types";

const items: RoadmapProgressItem[] = [
  {
    id: "r1",
    title: "React Fundamentals",
    progressPercentage: 80,
    completedSteps: 8,
    totalSteps: 10,
  },
  {
    id: "r2",
    title: "Node.js Backend",
    progressPercentage: 40,
    completedSteps: 4,
    totalSteps: 10,
  },
];

describe("DashboardProgress", () => {
  it("renders section title with roadmap count", () => {
    render(<DashboardProgress data={items} />);
    expect(screen.getByText("Roadmap Progress")).toBeInTheDocument();
    expect(screen.getByText("2 roadmaps")).toBeInTheDocument();
  });

  it("uses singular when only 1 roadmap", () => {
    render(<DashboardProgress data={[items[0]]} />);
    expect(screen.getByText("1 roadmap")).toBeInTheDocument();
  });

  it("renders each roadmap with title, percentage, and step count", () => {
    render(<DashboardProgress data={items} />);
    expect(screen.getByText("React Fundamentals")).toBeInTheDocument();
    expect(screen.getByText("80%")).toBeInTheDocument();
    expect(screen.getByText("8/10 steps")).toBeInTheDocument();

    expect(screen.getByText("Node.js Backend")).toBeInTheDocument();
    expect(screen.getByText("40%")).toBeInTheDocument();
    expect(screen.getByText("4/10 steps")).toBeInTheDocument();
  });

  it("navigates to roadmap detail on click", async () => {
    const user = userEvent.setup();
    render(<DashboardProgress data={items} />);

    await user.click(screen.getByText("React Fundamentals"));
    expect(mockRouter.push).toHaveBeenCalledWith("/roadmaps/r1");
  });
});
