import type { DocumentStatus, ProcessingStage } from "@sagepoint/domain";
import type { AuroraTone } from "@/shared/components";

export type AuroraStatus =
  | "inferring"
  | "processing"
  | "enriching"
  | "ready"
  | "failed";

export const STATUS_META: Record<
  AuroraStatus,
  { label: string; tone: AuroraTone }
> = {
  inferring: { label: "Inferring", tone: "proc" },
  processing: { label: "Processing", tone: "proc" },
  enriching: { label: "Enriching", tone: "enrich" },
  ready: { label: "Ready", tone: "ready" },
  failed: { label: "Failed", tone: "fail" },
};

export const PIPELINE_STAGES = ["Parsing", "Analyzing", "Enriching"] as const;

export function mapToAuroraStatus(
  status: DocumentStatus | string,
  stage?: ProcessingStage | string | null,
): AuroraStatus {
  if (status === "FAILED") return "failed";
  if (stage === "READY") return "ready";
  if (stage === "ENRICHING") return "enriching";
  if (stage === "PARSING" || stage === "ANALYZING" || stage === "SUMMARIZED")
    return "processing";
  return "inferring";
}

export function mapToPipelineStage(
  stage?: ProcessingStage | string | null,
): 1 | 2 | 3 {
  if (stage === "ENRICHING" || stage === "READY") return 3;
  if (stage === "ANALYZING" || stage === "SUMMARIZED") return 2;
  return 1;
}
