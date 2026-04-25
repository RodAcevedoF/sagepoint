import "@test/_helpers/next-mocks";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { DashboardRoadmaps } from "@/features/dashboard/components/DashboardRoadmaps/DashboardRoadmaps";
import { mockRouter } from "@test/_helpers/next-mocks";
import type {
  RoadmapItem,
  RoadmapsOverview,
} from "@/features/dashboard/types/dashboard.types";

vi.mock("@/shared/hooks", () => ({
  useRoadmapEvents: () => ({ status: null, stage: null }),
}));

const roadmaps: RoadmapItem[] = [
  {
    id: "r1",
    title: "Docker Deep Dive",
    createdAt: "2026-03-16T10:00:00Z",
    lastActivityAt: null,
    generationStatus: "completed",
    progressPercentage: 60,
    completedSteps: 3,
    totalSteps: 5,
  },
  {
    id: "r2",
    title: "TypeScript Mastery",
    createdAt: "2026-03-14T12:00:00Z",
    lastActivityAt: null,
    generationStatus: "completed",
    progressPercentage: 100,
    completedSteps: 7,
    totalSteps: 7,
  },
];

const overview: RoadmapsOverview = {
  inProgress: 1,
  completed: 1,
  justCreated: 0,
};

describe("DashboardRoadmaps", () => {
  it("renders section title", () => {
    render(
      <DashboardRoadmaps
        roadmaps={roadmaps}
        overview={overview}
        allRoadmaps={[]}
      />,
    );
    expect(screen.getByText("Your Roadmaps")).toBeInTheDocument();
  });

  it("renders overview chips with correct counts", () => {
    render(
      <DashboardRoadmaps
        roadmaps={roadmaps}
        overview={overview}
        allRoadmaps={[]}
      />,
    );
    expect(screen.getByText(/1 in progress/i)).toBeInTheDocument();
    expect(screen.getByText(/1 completed/i)).toBeInTheDocument();
  });

  it("does not render a chip when count is zero", () => {
    render(
      <DashboardRoadmaps
        roadmaps={roadmaps}
        overview={overview}
        allRoadmaps={[]}
      />,
    );
    expect(screen.queryByText(/just created/i)).not.toBeInTheDocument();
  });

  it("renders each roadmap card with title", () => {
    render(
      <DashboardRoadmaps
        roadmaps={roadmaps}
        overview={overview}
        allRoadmaps={[]}
      />,
    );
    expect(screen.getByText("Docker Deep Dive")).toBeInTheDocument();
    expect(screen.getByText("TypeScript Mastery")).toBeInTheDocument();
  });

  it("navigates to roadmap detail on card click", async () => {
    const user = userEvent.setup();
    render(
      <DashboardRoadmaps
        roadmaps={roadmaps}
        overview={overview}
        allRoadmaps={[]}
      />,
    );
    await user.click(screen.getByText("Docker Deep Dive"));
    expect(mockRouter.push).toHaveBeenCalledWith("/roadmaps/r1");
  });

  it('"View all" navigates to /roadmaps', async () => {
    const user = userEvent.setup();
    render(
      <DashboardRoadmaps
        roadmaps={roadmaps}
        overview={overview}
        allRoadmaps={[]}
      />,
    );
    await user.click(screen.getByText(/view all/i));
    expect(mockRouter.push).toHaveBeenCalledWith("/roadmaps");
  });
});
