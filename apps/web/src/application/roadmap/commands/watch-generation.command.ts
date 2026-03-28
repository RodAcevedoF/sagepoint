"use client";

import { useEffect, useRef } from "react";
import { useRoadmapEvents, useAppDispatch } from "@/common/hooks";
import { roadmapApi } from "@/infrastructure/api/roadmapApi";
import type { RoadmapEventStatus, RoadmapEventStage } from "@/common/hooks";

interface GenerationState {
  status: RoadmapEventStatus;
  stage: RoadmapEventStage;
  errorMessage: string | null;
}

/**
 * Watches a roadmap's generation progress via SSE.
 * Invalidates the roadmap list cache when generation completes.
 */
export function useWatchGenerationCommand(
  roadmapId: string | null,
): GenerationState {
  const dispatch = useAppDispatch();
  const { status, stage, errorMessage } = useRoadmapEvents(roadmapId);
  const hasInvalidated = useRef(false);

  useEffect(() => {
    if (status === "completed" && !hasInvalidated.current) {
      hasInvalidated.current = true;
      dispatch(
        roadmapApi.util.invalidateTags([{ type: "Roadmap", id: "LIST" }]),
      );
    }
  }, [status, dispatch]);

  return { status, stage, errorMessage };
}
