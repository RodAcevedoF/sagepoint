"use client";

import { useDocumentEvents } from "@/shared/hooks";
import { useWatchProcessingCommand } from "@/application/common/commands/watch-processing.command";
import type { SseState } from "@/shared/hooks/useSseEvents";
import type { DocumentEventStage } from "@/shared/hooks";

/**
 * Watches a document's processing progress via SSE.
 * Invalidates the document list cache when processing completes.
 */
export function useWatchDocumentProcessingCommand(
  documentId: string | null,
): SseState<DocumentEventStage> {
  const state = useDocumentEvents(documentId);
  useWatchProcessingCommand(state, [{ type: "Document", id: "LIST" }]);
  return state;
}
