import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { DashboardGreeting } from "@/features/dashboard/components/DashboardGreeting";

describe("DashboardGreeting", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows morning greeting before noon", () => {
    vi.setSystemTime(new Date("2026-03-16T09:00:00"));
    render(<DashboardGreeting userName="John Doe" />);
    expect(screen.getByText(/good morning, john!/i)).toBeInTheDocument();
  });

  it("shows afternoon greeting between noon and 6pm", () => {
    vi.setSystemTime(new Date("2026-03-16T14:00:00"));
    render(<DashboardGreeting userName="Jane Smith" />);
    expect(screen.getByText(/good afternoon, jane!/i)).toBeInTheDocument();
  });

  it("shows evening greeting after 6pm", () => {
    vi.setSystemTime(new Date("2026-03-16T20:00:00"));
    render(<DashboardGreeting userName="Bob" />);
    expect(screen.getByText(/good evening, bob!/i)).toBeInTheDocument();
  });

  it("shows steps completed message when stepsCompleted > 0", () => {
    vi.setSystemTime(new Date("2026-03-16T10:00:00"));
    render(<DashboardGreeting userName="Alice" stepsCompleted={12} />);
    expect(screen.getByText(/completed 12 steps/i)).toBeInTheDocument();
  });

  it("shows default message when no steps completed", () => {
    vi.setSystemTime(new Date("2026-03-16T10:00:00"));
    render(<DashboardGreeting userName="Alice" stepsCompleted={0} />);
    expect(screen.getByText(/ready to continue/i)).toBeInTheDocument();
  });

  it("uses first name only", () => {
    vi.setSystemTime(new Date("2026-03-16T10:00:00"));
    render(<DashboardGreeting userName="Maria Garcia Lopez" />);
    expect(screen.getByText(/maria!/i)).toBeInTheDocument();
    expect(screen.queryByText(/garcia/i)).not.toBeInTheDocument();
  });
});
