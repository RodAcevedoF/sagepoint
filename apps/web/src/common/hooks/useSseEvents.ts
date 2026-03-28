"use client";

import { useMemo, useSyncExternalStore, useCallback } from "react";

export type SseStatus =
  | "connecting"
  | "pending"
  | "processing"
  | "completed"
  | "failed";

export interface SseState<TStage extends string = string> {
  status: SseStatus;
  stage: TStage | null;
  errorMessage: string | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

function createSseStore<TStage extends string>(
  url: string,
  completedStage: TStage,
) {
  const initialState: SseState<TStage> = {
    status: "connecting",
    stage: null,
    errorMessage: null,
  };

  let state: SseState<TStage> = { ...initialState };
  const listeners = new Set<() => void>();
  let eventSource: EventSource | null = null;

  function emit() {
    listeners.forEach((l) => l());
  }

  function update(patch: Partial<SseState<TStage>>) {
    state = { ...state, ...patch };
    emit();
  }

  function cleanup() {
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
  }

  const es = new EventSource(url, { withCredentials: true });
  eventSource = es;

  es.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data) as {
        type: string;
        stage?: string;
        status?: string;
        message?: string;
      };

      switch (data.type) {
        case "status":
          update({
            status: (data.status as SseStatus) || "pending",
            stage: (data.stage as TStage) ?? null,
          });
          break;
        case "progress":
          update({
            status: "processing",
            stage: (data.stage as TStage) ?? null,
          });
          break;
        case "completed":
          update({ status: "completed", stage: completedStage });
          cleanup();
          break;
        case "failed":
          update({
            status: "failed",
            errorMessage: data.message || "Processing failed",
          });
          cleanup();
          break;
        case "error":
          update({
            status: "failed",
            errorMessage: data.message || "Unknown error",
          });
          cleanup();
          break;
      }
    } catch {
      // Ignore parse errors
    }
  };

  es.onerror = () => {
    update({ status: "connecting" });
  };

  return {
    getSnapshot: () => state,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0) cleanup();
      };
    },
    initialState,
  };
}

/**
 * Generic SSE subscription hook.
 * @param path - API path (e.g. "/roadmaps/{id}/events")
 * @param completedStage - stage value to set on "completed" event
 * @param id - entity ID, or null to skip connection
 */
export function useSseEvents<TStage extends string>(
  path: string | null,
  completedStage: TStage,
): SseState<TStage> {
  const url = path ? `${API_URL}${path}` : null;

  const store = useMemo(
    () => (url ? createSseStore<TStage>(url, completedStage) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [url],
  );

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (!store) return () => {};
      return store.subscribe(onStoreChange);
    },
    [store],
  );

  const initialState: SseState<TStage> = {
    status: "connecting",
    stage: null,
    errorMessage: null,
  };

  const getSnapshot = useCallback(() => {
    if (!store) return initialState;
    return store.getSnapshot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store]);

  return useSyncExternalStore(subscribe, getSnapshot, () => initialState);
}
