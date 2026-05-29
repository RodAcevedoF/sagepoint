"use client";

import { useEventStream } from "./useEventStream";
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
  return useEventStream<RoadmapEventStage>({
    path: roadmapId ? `/roadmaps/${roadmapId}/events` : null,
    completedStage: "done",
    toasts: {
      start: "Generating your roadmap…",
      finish: "Your roadmap is ready!",
    },
    // The backend emits exactly one stage-less status event at a genuine phase-1
    // start; partial-complete reconnects always carry a stage, so this never
    // fires when opening a roadmap that is already mid-generation.
    startWhen: (s) =>
      (s.status === "pending" || s.status === "processing") && s.stage === null,
    isPhaseOneDone: (s) => s.stage === "resources" || s.stage === "done",
    invalidateOnPhaseOneDone: ["User", { type: "Roadmap", id: "LIST" }],
    invalidateOnComplete: roadmapId
      ? [
          { type: "Roadmap", id: "LIST" },
          { type: "RoadmapProgress", id: roadmapId },
          { type: "Resource", id: roadmapId },
        ]
      : [{ type: "Roadmap", id: "LIST" }],
  });
}
