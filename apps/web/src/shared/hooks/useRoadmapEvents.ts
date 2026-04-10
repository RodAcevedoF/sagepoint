"use client";

import { useSseEvents } from "./useSseEvents";
import type { SseState } from "./useSseEvents";

export type RoadmapEventStage =
  | "concepts"
  | "learning-path"
  | "resources"
  | "done";

export type RoadmapEventStatus = SseState["status"];

/**
 * SSE hook for roadmap generation events.
 * Pass null to skip connection.
 */
export function useRoadmapEvents(
  roadmapId: string | null,
): SseState<RoadmapEventStage> {
  return useSseEvents<RoadmapEventStage>(
    roadmapId ? `/roadmaps/${roadmapId}/events` : null,
    "done",
  );
}
