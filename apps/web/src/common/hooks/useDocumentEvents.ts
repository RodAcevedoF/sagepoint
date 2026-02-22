'use client';

import { useMemo, useSyncExternalStore, useCallback } from 'react';

export type DocumentEventStatus =
  | 'connecting'
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed';

export type DocumentEventStage =
  | 'parsing'
  | 'analyzing'
  | 'ready'
  | null;

interface DocumentEventsState {
  status: DocumentEventStatus;
  stage: DocumentEventStage;
  errorMessage: string | null;
}

const INITIAL_STATE: DocumentEventsState = {
  status: 'connecting',
  stage: null,
  errorMessage: null,
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function createDocumentEventStore(documentId: string) {
  let state: DocumentEventsState = { ...INITIAL_STATE };
  const listeners = new Set<() => void>();
  let eventSource: EventSource | null = null;

  function emit() {
    listeners.forEach((l) => l());
  }

  function update(patch: Partial<DocumentEventsState>) {
    state = { ...state, ...patch };
    emit();
  }

  function cleanup() {
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
  }

  const es = new EventSource(`${API_URL}/documents/${documentId}/events`, {
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
            status: (data.status as DocumentEventStatus) || 'pending',
            stage: (data.stage as DocumentEventStage) ?? null,
          });
          break;
        case 'progress':
          update({
            status: 'processing',
            stage: (data.stage as DocumentEventStage) ?? null,
          });
          break;
        case 'completed':
          update({ status: 'completed', stage: 'ready' });
          cleanup();
          break;
        case 'failed':
          update({
            status: 'failed',
            errorMessage: data.message || 'Processing failed',
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
        if (listeners.size === 0) {
          cleanup();
        }
      };
    },
  };
}

/**
 * SSE hook that subscribes to document processing events.
 * Pass null to skip connection (e.g. when document is already completed).
 */
export function useDocumentEvents(
  documentId: string | null,
): DocumentEventsState {
  const store = useMemo(
    () =>
      documentId
        ? createDocumentEventStore(documentId)
        : null,
    [documentId],
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
