"use client";

import { useRoadmapEvents } from "@/shared/hooks";
import { useWatchProcessingCommand } from "@/application/common/commands/watch-processing.command";
import type { SseState } from "@/shared/hooks/useSseEvents";
import type { RoadmapEventStage } from "@/shared/hooks";

/**
 * Watches a roadmap's generation progress via SSE.
 * Invalidates the roadmap list cache when generation completes.
 */
export function useWatchGenerationCommand(
  roadmapId: string | null,
): SseState<RoadmapEventStage> {
  const state = useRoadmapEvents(roadmapId);
  useWatchProcessingCommand(state, [{ type: "Roadmap", id: "LIST" }]);
  return state;
}
