"use client";

import { useRoadmapEvents } from "@/shared/hooks";
import { useWatchProcessingCommand } from "@/application/common/commands/watch-processing.command";
import type { SseState } from "@/shared/hooks/useSseEvents";
import type { RoadmapEventStage } from "@/shared/hooks";

/**
 * Watches a roadmap's generation progress via SSE.
 * On final completion (phase 2 done) invalidates the roadmap list, specific roadmap progress,
 * and resources so the UI refreshes without a manual reload.
 */
export function useWatchGenerationCommand(
  roadmapId: string | null,
): SseState<RoadmapEventStage> {
  const state = useRoadmapEvents(roadmapId);
  useWatchProcessingCommand(state, [
    { type: "Roadmap", id: "LIST" },
    ...(roadmapId
      ? [
          { type: "RoadmapProgress" as const, id: roadmapId },
          { type: "Resource" as const, id: roadmapId },
        ]
      : []),
  ]);
  return state;
}
