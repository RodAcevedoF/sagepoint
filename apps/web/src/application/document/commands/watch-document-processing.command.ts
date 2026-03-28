"use client";

import { useDocumentEvents } from "@/common/hooks";
import { useWatchProcessingCommand } from "@/application/common/commands/watch-processing.command";
import type { SseState } from "@/common/hooks/useSseEvents";
import type { DocumentEventStage } from "@/common/hooks";

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
