import "@test/_helpers/next-mocks";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "@test/_helpers/msw-server";
import { renderWithProviders } from "@test/_helpers/render";
import { RoadmapCard } from "@/features/roadmap/components/RoadmapCard";
import { mockRouter } from "@test/_helpers/next-mocks";
import { makeUserRoadmap } from "@test/_helpers/fixtures";
import { RoadmapVisibility } from "@sagepoint/domain";

const API = "http://localhost:3001";

describe("RoadmapCard", () => {
  it("renders roadmap title and description", () => {
    const data = makeUserRoadmap({
      title: "Docker Mastery",
      description: "Learn containers",
    });
    renderWithProviders(<RoadmapCard data={data} />);

    expect(screen.getByText("Docker Mastery")).toBeInTheDocument();
    expect(screen.getByText("Learn containers")).toBeInTheDocument();
  });

  it("renders progress percentage", () => {
    const data = makeUserRoadmap({ completed: 3, total: 5 });
    renderWithProviders(<RoadmapCard data={data} />);

    expect(screen.getByText("60%")).toBeInTheDocument();
  });

  it("renders step count", () => {
    const data = makeUserRoadmap({ completed: 4, total: 8 });
    renderWithProviders(<RoadmapCard data={data} />);

    expect(screen.getByText("4/8 steps")).toBeInTheDocument();
  });

  it("renders estimated duration", () => {
    const data = makeUserRoadmap({ total: 4 });
    // 4 steps × 30 min = 120 min = 2h
    renderWithProviders(<RoadmapCard data={data} />);

    expect(screen.getByText("2h")).toBeInTheDocument();
  });

  it('renders status badge as "In Progress" when partially completed', () => {
    const data = makeUserRoadmap({ completed: 2, total: 5 });
    renderWithProviders(<RoadmapCard data={data} />);

    expect(screen.getByText("In Progress")).toBeInTheDocument();
  });

  it('renders status badge as "Completed" when 100%', () => {
    const data = makeUserRoadmap({ completed: 5, total: 5 });
    renderWithProviders(<RoadmapCard data={data} />);

    expect(screen.getByText("Completed")).toBeInTheDocument();
  });

  it('renders status badge as "New" when no progress', () => {
    const data = makeUserRoadmap({ completed: 0, total: 5 });
    data.progress.inProgressSteps = 0;
    renderWithProviders(<RoadmapCard data={data} />);

    expect(screen.getByText("New")).toBeInTheDocument();
  });

  it("renders difficulty distribution chips", () => {
    const data = makeUserRoadmap({ total: 3 });
    renderWithProviders(<RoadmapCard data={data} />);

    expect(screen.getByText("3 beginner")).toBeInTheDocument();
  });

  it("shows recommended pace chip", () => {
    const data = makeUserRoadmap();
    renderWithProviders(<RoadmapCard data={data} />);

    expect(screen.getByText("2 hours/day")).toBeInTheDocument();
  });

  it("navigates to roadmap detail on click", async () => {
    const user = userEvent.setup();
    const data = makeUserRoadmap({ id: "r-abc" });
    renderWithProviders(<RoadmapCard data={data} />);

    await user.click(screen.getByText("Test Roadmap"));
    expect(mockRouter.push).toHaveBeenCalledWith("/roadmaps/r-abc");
  });

  it("toggles visibility on icon button click", async () => {
    const user = userEvent.setup();
    server.use(
      http.patch(`${API}/roadmaps/:id/visibility`, () =>
        HttpResponse.json({ id: "r1", visibility: "PUBLIC" }),
      ),
    );

    const data = makeUserRoadmap({ visibility: RoadmapVisibility.PRIVATE });
    renderWithProviders(<RoadmapCard data={data} />);

    const visibilityBtn = screen.getByRole("button", { name: /private/i });
    expect(visibilityBtn).toBeInTheDocument();

    await user.click(visibilityBtn);
    // Mutation fired (no error thrown)
  });

  it("shows relative time", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-16T12:00:00Z"));
    const data = makeUserRoadmap({ createdAt: "2026-03-16T10:00:00Z" });
    renderWithProviders(<RoadmapCard data={data} />);
    expect(screen.getByText("2h ago")).toBeInTheDocument();
    vi.useRealTimers();
  });
});
