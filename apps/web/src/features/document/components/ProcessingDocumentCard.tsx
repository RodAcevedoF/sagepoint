"use client";

import { useEffect, useRef } from "react";
import { FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, AuroraSkeleton, Pipeline, toneColor } from "@/shared/components";
import { useDocumentEvents, useAppDispatch } from "@/shared/hooks";
import { documentApi } from "@/infrastructure/api/documentApi";
import type { DocumentDetailDto } from "@/infrastructure/api/documentApi";
import { mapToPipelineStage, PIPELINE_STAGES } from "../utils";

interface ProcessingDocumentCardProps {
  document: DocumentDetailDto;
  onComplete?: () => void;
}

const SSE_STAGE_TO_PIPELINE: Record<string, 1 | 2 | 3> = {
  parsing: 1,
  analyzing: 2,
  summarized: 2,
  enriching: 3,
  ready: 3,
};

export function ProcessingDocumentCard({
  document,
  onComplete,
}: ProcessingDocumentCardProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const hasNotified = useRef(false);
  const hasSummarized = useRef(false);
  const { status, stage } = useDocumentEvents(document.id);

  useEffect(() => {
    if (status === "completed" && !hasNotified.current) {
      hasNotified.current = true;
      onComplete?.();
    }
  }, [status, onComplete]);

  useEffect(() => {
    if (stage === "summarized" && !hasSummarized.current) {
      hasSummarized.current = true;
      dispatch(
        documentApi.util.invalidateTags([{ type: "Document", id: "LIST" }]),
      );
    }
  }, [stage, dispatch]);

  const pipelineStage: 1 | 2 | 3 =
    (stage && SSE_STAGE_TO_PIPELINE[stage]) ??
    mapToPipelineStage(document.processingStage);

  return (
    <Card
      variant="aurora"
      accent={toneColor("proc")}
      onClick={() => router.push(`/documents/${document.id}`)}
    >
      <Pipeline
        stages={PIPELINE_STAGES}
        currentIndex={pipelineStage - 1}
        eta="~processing"
      />

      <Card.Body style={{ paddingTop: 6 }}>
        <Card.Head>
          <Card.Icon>
            <FileText size={22} />
          </Card.Icon>
          <Card.HeadText
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 9,
              paddingTop: 4,
            }}
          >
            <Card.Title title={document.filename}>
              {document.filename}
            </Card.Title>
            <AuroraSkeleton height={11} width="44%" />
          </Card.HeadText>
        </Card.Head>
        <AuroraSkeleton height={11} width="92%" />
        <AuroraSkeleton height={11} width="70%" />
      </Card.Body>

      <Card.Foot>
        <Card.FootDate>extracting concepts…</Card.FootDate>
      </Card.Foot>
    </Card>
  );
}
