"use client";

import { useEffect } from "react";
import { useSseEvents } from "./useSseEvents";
import type { SseState } from "./useSseEvents";
import { useSnackbar } from "@/shared/components/feedback/Snackbar/snackbar-context";

export type DocumentEventStage =
  | "parsing"
  | "analyzing"
  | "summarized"
  | "enriching"
  | "ready";

export type DocumentEventStatus = SseState["status"];

// Module-level dedupe: each document toasts at most once per session, even when
// the hook is mounted in several cards/views simultaneously.
// Start is already announced by UploadDocumentModal, so we only toast on finish.
const finishedIds = new Set<string>();

/**
 * SSE hook for document processing events.
 * Pass null to skip connection.
 */
export function useDocumentEvents(
  documentId: string | null,
): SseState<DocumentEventStage> {
  const state = useSseEvents<DocumentEventStage>(
    documentId ? `/documents/${documentId}/events` : null,
    "ready",
  );

  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    if (!documentId) return;
    if (state.status === "completed" && !finishedIds.has(documentId)) {
      finishedIds.add(documentId);
      showSnackbar("Document analysis complete!", { severity: "success" });
    }
  }, [state.status, documentId, showSnackbar]);

  return state;
}
