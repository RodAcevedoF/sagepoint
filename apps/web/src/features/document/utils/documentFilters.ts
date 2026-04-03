import type { DocumentStatus } from "@sagepoint/domain";

export type StageFilter = "all" | "processing" | "ready";

export function isDocumentProcessing(status: DocumentStatus | string): boolean {
  return status !== "COMPLETED" && status !== "FAILED";
}

interface DocumentWithStatus {
  filename: string;
  status: DocumentStatus | string;
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
    const processing = isDocumentProcessing(doc.status);
    const matchesFilter =
      stageFilter === "all" ||
      (stageFilter === "processing" && processing) ||
      (stageFilter === "ready" && !processing);
    return matchesSearch && matchesFilter;
  });

  return {
    processingDocs: filtered.filter((d) => isDocumentProcessing(d.status)),
    completedDocs: filtered.filter((d) => !isDocumentProcessing(d.status)),
  };
}
