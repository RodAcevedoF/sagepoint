"use client";

import { useEffect, useRef } from "react";
import { useAppDispatch } from "@/shared/hooks";
import type { SseState } from "@/shared/hooks/useSseEvents";
import { baseApi, type ApiTagType } from "@/infrastructure/api/baseApi";
import type { TagDescription } from "@reduxjs/toolkit/query";

/**
 * Generic command that watches an SSE-driven processing state
 * and invalidates cache tags when processing completes.
 */
export function useWatchProcessingCommand<TStage extends string>(
  state: SseState<TStage>,
  invalidateTags: TagDescription<ApiTagType>[],
): void {
  const dispatch = useAppDispatch();
  const hasInvalidated = useRef(false);

  useEffect(() => {
    if (state.status === "completed" && !hasInvalidated.current) {
      hasInvalidated.current = true;
      dispatch(baseApi.util.invalidateTags(invalidateTags));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.status, dispatch]);
}
