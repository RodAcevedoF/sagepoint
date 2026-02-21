'use client';

import { useMemo, useSyncExternalStore, useCallback } from 'react';

export type RoadmapEventStatus =
  | 'connecting'
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed';

export type RoadmapEventStage =
  | 'concepts'
  | 'learning-path'
  | 'resources'
  | 'done'
  | null;

interface RoadmapEventsState {
  status: RoadmapEventStatus;
  stage: RoadmapEventStage;
  errorMessage: string | null;
}

const INITIAL_STATE: RoadmapEventsState = {
  status: 'connecting',
  stage: null,
  errorMessage: null,
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/** Creates an external store for SSE events */
function createRoadmapEventStore(roadmapId: string) {
  let state: RoadmapEventsState = { ...INITIAL_STATE };
  const listeners = new Set<() => void>();
  let eventSource: EventSource | null = null;

  function emit() {
    listeners.forEach((l) => l());
  }

  function update(patch: Partial<RoadmapEventsState>) {
    state = { ...state, ...patch };
    emit();
  }

  function cleanup() {
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
  }

  // Start connection
  const es = new EventSource(`${API_URL}/roadmaps/${roadmapId}/events`, {
    withCredentials: true,
  });
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
        case 'status':
          update({
            status: (data.status as RoadmapEventStatus) || 'pending',
          });
          break;
        case 'progress':
          update({
            status: 'processing',
            stage: (data.stage as RoadmapEventStage) ?? null,
          });
          break;
        case 'completed':
          update({ status: 'completed', stage: 'done' });
          cleanup();
          break;
        case 'failed':
          update({
            status: 'failed',
            errorMessage: data.message || 'Generation failed',
          });
          cleanup();
          break;
        case 'error':
          update({
            status: 'failed',
            errorMessage: data.message || 'Unknown error',
          });
          cleanup();
          break;
      }
    } catch {
      // Ignore parse errors
    }
  };

  es.onerror = () => {
    update({ status: 'connecting' });
  };

  return {
    getSnapshot: () => state,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
        // Cleanup when last listener unsubscribes
        if (listeners.size === 0) {
          cleanup();
        }
      };
    },
  };
}

/**
 * SSE hook that subscribes to roadmap generation events.
 * Uses useSyncExternalStore for lint-safe external subscription.
 */
export function useRoadmapEvents(
  roadmapId: string | null,
): RoadmapEventsState {
  const store = useMemo(
    () =>
      roadmapId
        ? createRoadmapEventStore(roadmapId)
        : null,
    [roadmapId],
  );

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (!store) return () => {};
      return store.subscribe(onStoreChange);
    },
    [store],
  );

  const getSnapshot = useCallback(() => {
    if (!store) return INITIAL_STATE;
    return store.getSnapshot();
  }, [store]);

  return useSyncExternalStore(subscribe, getSnapshot, () => INITIAL_STATE);
}
