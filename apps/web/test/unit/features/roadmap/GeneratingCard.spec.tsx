import "@test/_helpers/next-mocks";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, act } from "@testing-library/react";
import { GeneratingCard } from "@/features/roadmap/components/GeneratingCard/GeneratingCard";
import { makeUserRoadmap } from "@test/_helpers/fixtures";
import type { SseState } from "@/shared/hooks/useSseEvents";
import type { RoadmapEventStage } from "@/shared/hooks/useRoadmapEvents";

const mockSseState: SseState<RoadmapEventStage> = {
  status: "connecting",
  stage: null,
  errorMessage: null,
};

vi.mock("@/shared/hooks", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/shared/hooks")>();
  return {
    ...actual,
    useRoadmapEvents: vi.fn(() => mockSseState),
  };
});

import { useRoadmapEvents } from "@/shared/hooks";

function setSSE(partial: Partial<SseState<RoadmapEventStage>>) {
  Object.assign(mockSseState, partial);
  vi.mocked(useRoadmapEvents).mockReturnValue({ ...mockSseState });
}

describe("GeneratingCard onComplete", () => {
  const data = makeUserRoadmap({ status: "processing" });

  beforeEach(() => {
    Object.assign(mockSseState, {
      status: "connecting",
      stage: null,
      errorMessage: null,
    });
    vi.mocked(useRoadmapEvents).mockReturnValue({ ...mockSseState });
  });

  it("fires onComplete when partial-complete arrives (status=processing, stage=learning-path)", () => {
    const onComplete = vi.fn();
    const { rerender } = render(
      <GeneratingCard data={data} onComplete={onComplete} />,
    );

    setSSE({ status: "processing", stage: "learning-path" });
    act(() => {
      rerender(<GeneratingCard data={data} onComplete={onComplete} />);
    });

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("fires onComplete when final completed event arrives", () => {
    const onComplete = vi.fn();
    const { rerender } = render(
      <GeneratingCard data={data} onComplete={onComplete} />,
    );

    setSSE({ status: "completed", stage: "done" });
    act(() => {
      rerender(<GeneratingCard data={data} onComplete={onComplete} />);
    });

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("does NOT fire onComplete while still at stage=concepts", () => {
    const onComplete = vi.fn();
    const { rerender } = render(
      <GeneratingCard data={data} onComplete={onComplete} />,
    );

    setSSE({ status: "processing", stage: "concepts" });
    act(() => {
      rerender(<GeneratingCard data={data} onComplete={onComplete} />);
    });

    expect(onComplete).not.toHaveBeenCalled();
  });

  it("does NOT fire onComplete twice across rerenders at the same stage", () => {
    const onComplete = vi.fn();
    const { rerender } = render(
      <GeneratingCard data={data} onComplete={onComplete} />,
    );

    setSSE({ status: "processing", stage: "learning-path" });
    act(() => {
      rerender(<GeneratingCard data={data} onComplete={onComplete} />);
    });
    act(() => {
      rerender(<GeneratingCard data={data} onComplete={onComplete} />);
    });
    act(() => {
      rerender(<GeneratingCard data={data} onComplete={onComplete} />);
    });

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("fires onComplete again on final completed if partial-complete refetch returned stale data (card stayed mounted)", () => {
    const onComplete = vi.fn();
    const { rerender } = render(
      <GeneratingCard data={data} onComplete={onComplete} />,
    );

    // partial-complete fires → onComplete called once
    setSSE({ status: "processing", stage: "learning-path" });
    act(() => {
      rerender(<GeneratingCard data={data} onComplete={onComplete} />);
    });
    expect(onComplete).toHaveBeenCalledTimes(1);

    // phase-2 resources progress (resets hasNotified)
    setSSE({ status: "processing", stage: "resources" });
    act(() => {
      rerender(<GeneratingCard data={data} onComplete={onComplete} />);
    });

    // final completed → onComplete fires again (saves the stuck UI)
    setSSE({ status: "completed", stage: "done" });
    act(() => {
      rerender(<GeneratingCard data={data} onComplete={onComplete} />);
    });
    expect(onComplete).toHaveBeenCalledTimes(2);
  });
});
