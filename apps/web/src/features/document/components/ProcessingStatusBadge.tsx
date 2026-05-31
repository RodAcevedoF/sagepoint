"use client";

import type { ProcessingStage } from "@sagepoint/domain";
import { StatusPill } from "@/shared/components";
import { mapToAuroraStatus, STATUS_META } from "../utils";

interface ProcessingStatusBadgeProps {
  stage: ProcessingStage;
}

export function ProcessingStatusBadge({ stage }: ProcessingStatusBadgeProps) {
  const status = mapToAuroraStatus("PROCESSING", stage);
  const meta = STATUS_META[status];
  const pulse = status === "processing" || status === "enriching";

  return <StatusPill tone={meta.tone} label={meta.label} pulse={pulse} />;
}
