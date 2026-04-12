import type { DocumentStatus, ProcessingStage } from "@sagepoint/domain";

export type StageFilter = "all" | "processing" | "ready";

export const SUMMARY_READY_STAGES = new Set<string>([
  "SUMMARIZED",
  "ENRICHING",
  "READY",
]);

export function isDocumentProcessing(
  status: DocumentStatus | string,
  processingStage?: ProcessingStage | string | null,
): boolean {
  if (status === "COMPLETED" || status === "FAILED") return false;
  if (processingStage && SUMMARY_READY_STAGES.has(processingStage))
    return false;
  return true;
}

interface DocumentWithStatus {
  filename: string;
  status: DocumentStatus | string;
  processingStage?: ProcessingStage | string | null;
}

export function filterAndPartitionDocuments<T extends DocumentWithStatus>(
  documents: T[],
  searchQuery: string,
  stageFilter: StageFilter,
) {
  if (!documents.length)
    return { processingDocs: [] as T[], completedDocs: [] as T[] };

  const filtered = documents.filter((doc) => {
    const matchesSearch =
      !searchQuery ||
      doc.filename.toLowerCase().includes(searchQuery.toLowerCase());
    const processing = isDocumentProcessing(doc.status, doc.processingStage);
    const matchesFilter =
      stageFilter === "all" ||
      (stageFilter === "processing" && processing) ||
      (stageFilter === "ready" && !processing);
    return matchesSearch && matchesFilter;
  });

  return {
    processingDocs: filtered.filter((d) =>
      isDocumentProcessing(d.status, d.processingStage),
    ),
    completedDocs: filtered.filter(
      (d) => !isDocumentProcessing(d.status, d.processingStage),
    ),
  };
}
