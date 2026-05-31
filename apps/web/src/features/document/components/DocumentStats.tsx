"use client";

import { FileText, CheckCircle, Brain, Loader2 } from "lucide-react";
import { StatCard, StatGrid } from "@/shared/components";
import type { DocumentDetailDto } from "@/infrastructure/api/documentApi";
import { isDocumentProcessing } from "../utils";

interface DocumentStatsProps {
  documents: DocumentDetailDto[];
}

export function DocumentStats({ documents }: DocumentStatsProps) {
  const total = documents.length;
  const ready = documents.filter((d) => d.processingStage === "READY").length;
  const processing = documents.filter((d) =>
    isDocumentProcessing(d.status, d.processingStage),
  ).length;
  const concepts = documents.reduce(
    (sum, d) =>
      sum + (d.processingStage === "READY" ? (d.conceptCount ?? 0) : 0),
    0,
  );

  return (
    <StatGrid style={{ marginTop: 28, marginBottom: 28 }}>
      <StatCard
        icon={<FileText size={20} />}
        value={total}
        label="Total Documents"
        tone="teal"
      />
      <StatCard
        icon={<Loader2 size={20} />}
        value={processing}
        label="Processing"
        tone="proc"
      />
      <StatCard
        icon={<CheckCircle size={20} />}
        value={ready}
        label="Analyzed"
        tone="ready"
      />
      <StatCard
        icon={<Brain size={20} />}
        value={concepts}
        label="Concepts Extracted"
        tone="concept"
      />
    </StatGrid>
  );
}
