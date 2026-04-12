"use client";

import { useSseEvents } from "./useSseEvents";
import type { SseState } from "./useSseEvents";

export type DocumentEventStage =
  | "parsing"
  | "analyzing"
  | "summarized"
  | "enriching"
  | "ready";

export type DocumentEventStatus = SseState["status"];

/**
 * SSE hook for document processing events.
 * Pass null to skip connection.
 */
export function useDocumentEvents(
  documentId: string | null,
): SseState<DocumentEventStage> {
  return useSseEvents<DocumentEventStage>(
    documentId ? `/documents/${documentId}/events` : null,
    "ready",
  );
}
