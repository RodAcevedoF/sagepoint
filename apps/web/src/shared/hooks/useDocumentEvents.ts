"use client";

import { useEventStream } from "./useEventStream";
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
  return useEventStream<DocumentEventStage>({
    path: documentId ? `/documents/${documentId}/events` : null,
    completedStage: "ready",
    // Start is already announced by UploadDocumentModal, so finish only.
    toasts: { finish: "Document analysis complete!" },
    invalidateOnComplete: [{ type: "Document", id: "LIST" }],
  });
}
