import "@test/_helpers/next-mocks";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { DashboardActivity } from "@/features/dashboard/components/DashboardActivity";
import { mockRouter } from "@test/_helpers/next-mocks";
import type { RecentRoadmapItem } from "@/features/dashboard/types/dashboard.types";

const roadmaps: RecentRoadmapItem[] = [
  {
    id: "r1",
    title: "Docker Deep Dive",
    createdAt: "2026-03-16T10:00:00Z",
    progressPercentage: 60,
    completedSteps: 3,
    totalSteps: 5,
  },
  {
    id: "r2",
    title: "TypeScript Mastery",
    createdAt: "2026-03-14T12:00:00Z",
    progressPercentage: 30,
    completedSteps: 2,
    totalSteps: 7,
  },
];

describe("DashboardActivity", () => {
  it("renders section title", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-16T12:00:00Z"));
    render(<DashboardActivity roadmaps={roadmaps} />);
    expect(screen.getByText("Recent Roadmaps")).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("renders each roadmap with title and step count", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-16T12:00:00Z"));
    render(<DashboardActivity roadmaps={roadmaps} />);
    expect(screen.getByText("Docker Deep Dive")).toBeInTheDocument();
    expect(screen.getByText("3/5 steps completed")).toBeInTheDocument();
    expect(screen.getByText("TypeScript Mastery")).toBeInTheDocument();
    expect(screen.getByText("2/7 steps completed")).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("shows relative time for each roadmap", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-16T12:00:00Z"));
    render(<DashboardActivity roadmaps={roadmaps} />);
    expect(screen.getByText("2h ago")).toBeInTheDocument();
    expect(screen.getByText("2 days ago")).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("navigates to roadmap detail on click", async () => {
    const user = userEvent.setup();
    render(<DashboardActivity roadmaps={roadmaps} />);

    await user.click(screen.getByText("Docker Deep Dive"));
    expect(mockRouter.push).toHaveBeenCalledWith("/roadmaps/r1");
  });

  it('"View all" navigates to /roadmaps', async () => {
    const user = userEvent.setup();
    render(<DashboardActivity roadmaps={roadmaps} />);

    await user.click(screen.getByText(/view all/i));
    expect(mockRouter.push).toHaveBeenCalledWith("/roadmaps");
  });
});
