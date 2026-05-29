"use client";

import { useEffect, useRef } from "react";
import { useSseEvents } from "./useSseEvents";
import type { SseState } from "./useSseEvents";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/infrastructure/store/store";
import { userApi } from "@/infrastructure/api/userApi";
import { roadmapApi } from "@/infrastructure/api/roadmapApi";
import { useSnackbar } from "@/shared/components/feedback/Snackbar/snackbar-context";

export type RoadmapEventStage =
  | "concepts"
  | "learning-path"
  | "resources"
  | "done";

export type RoadmapEventStatus = SseState["status"];

// Module-level dedupe: each roadmap toasts at most once per session, even when
// the hook is mounted in several cards/views simultaneously.
const startedIds = new Set<string>();
const finishedIds = new Set<string>();

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
  const { showSnackbar } = useSnackbar();
  const invalidatedRef = useRef(false);

  useEffect(() => {
    invalidatedRef.current = false;
  }, [roadmapId]);

  useEffect(() => {
    if (!roadmapId) return;

    const isProcessing =
      state.status === "pending" || state.status === "processing";
    // The backend emits exactly one stage-less status event at a genuine
    // phase-1 start; partial-complete reconnects always carry a stage, so this
    // never fires when opening a roadmap that is already mid-generation.
    if (isProcessing && state.stage === null && !startedIds.has(roadmapId)) {
      startedIds.add(roadmapId);
      showSnackbar("Generating your roadmap…", { severity: "info" });
    }

    if (state.status === "completed" && !finishedIds.has(roadmapId)) {
      finishedIds.add(roadmapId);
      showSnackbar("Your roadmap is ready!", { severity: "success" });
    }
  }, [state.status, state.stage, roadmapId, showSnackbar]);

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
