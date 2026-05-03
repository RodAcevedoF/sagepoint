"use client";

import { useEffect, useRef } from "react";
import { useSseEvents } from "./useSseEvents";
import type { SseState } from "./useSseEvents";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/infrastructure/store/store";
import { userApi } from "@/infrastructure/api/userApi";
import { roadmapApi } from "@/infrastructure/api/roadmapApi";

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
  const state = useSseEvents<RoadmapEventStage>(
    roadmapId ? `/roadmaps/${roadmapId}/events` : null,
    "done",
  );

  const dispatch = useDispatch<AppDispatch>();
  const invalidatedRef = useRef(false);

  useEffect(() => {
    invalidatedRef.current = false;
  }, [roadmapId]);

  useEffect(() => {
    if (invalidatedRef.current) return;
    // Phase 1 done (partial-complete) → stage becomes "resources" or "done".
    // Completed event → status becomes "completed".
    // Token deduction in the worker happens before either transition.
    const phaseOneDone = state.stage === "resources" || state.stage === "done";
    if (phaseOneDone || state.status === "completed") {
      invalidatedRef.current = true;
      dispatch(userApi.util.invalidateTags(["User"]));
      dispatch(
        roadmapApi.util.invalidateTags([{ type: "Roadmap", id: "LIST" }]),
      );
    }
  }, [state.status, state.stage, dispatch]);

  return state;
}
