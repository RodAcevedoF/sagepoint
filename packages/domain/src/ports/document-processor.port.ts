export interface DocumentProcessingProgress {
  stage: "parsing" | "analyzing" | "summarized" | "enriching" | "ready";
}
