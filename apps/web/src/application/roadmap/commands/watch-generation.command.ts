"use client";

import { useRoadmapEvents } from "@/common/hooks";
import { useWatchProcessingCommand } from "@/application/common/commands/watch-processing.command";
import type { SseState } from "@/common/hooks/useSseEvents";
import type { RoadmapEventStage } from "@/common/hooks";

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
