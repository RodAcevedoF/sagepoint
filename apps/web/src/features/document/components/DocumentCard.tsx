"use client";

import { createElement, useEffect, useState } from "react";
import { Trash2, ArrowRight, Layers, FileType2, Brain } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Card,
  AuroraIconButton,
  ConfirmDialog,
  toneColor,
  useSnackbar,
} from "@/shared/components";
import { useDocumentEvents, useAppDispatch } from "@/shared/hooks";
import { useDeleteDocumentCommand } from "@/application/document";
import { documentApi } from "@/infrastructure/api/documentApi";
import { ProcessingStatusBadge } from "./ProcessingStatusBadge";
import type { DocumentDetailDto } from "@/infrastructure/api/documentApi";
import { ProcessingStage } from "@sagepoint/domain";
import {
  getDocumentIcon,
  formatFileSize,
  formatRelativeDate,
  mapToAuroraStatus,
  STATUS_META,
} from "../utils";

function DocumentIcon({
  mimeType,
  size,
  strokeWidth,
}: {
  mimeType?: string;
  size: number;
  strokeWidth?: number;
}) {
  return createElement(getDocumentIcon(mimeType), { size, strokeWidth });
}

interface DocumentCardProps {
  document: DocumentDetailDto;
}

const sseStageMap: Record<string, ProcessingStage> = {
  parsing: ProcessingStage.PARSING,
  analyzing: ProcessingStage.ANALYZING,
  summarized: ProcessingStage.SUMMARIZED,
  enriching: ProcessingStage.ENRICHING,
  ready: ProcessingStage.READY,
};

function fileTypeLabel(mimeType?: string): string {
  if (!mimeType) return "FILE";
  if (mimeType.includes("pdf")) return "PDF";
  if (mimeType.includes("markdown")) return "MD";
  if (mimeType.includes("text/plain")) return "TXT";
  if (mimeType.includes("word")) return "DOCX";
  const sub = mimeType.split("/")[1];
  return (sub ?? "FILE").toUpperCase().slice(0, 6);
}

export function DocumentCard({ document }: DocumentCardProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { execute: deleteDocument } = useDeleteDocumentCommand();
  const { showSnackbar } = useSnackbar();

  const { status: sseStatus, stage: sseStage } = useDocumentEvents(
    document.status === "PROCESSING" ? document.id : null,
  );

  useEffect(() => {
    if (sseStatus === "completed") {
      dispatch(
        documentApi.util.invalidateTags([{ type: "Document", id: "LIST" }]),
      );
    }
  }, [sseStatus, dispatch]);

  const stage: ProcessingStage =
    (sseStage && sseStageMap[sseStage]) || document.processingStage;
  const auroraStatus = mapToAuroraStatus(document.status, stage);
  const tone = STATUS_META[auroraStatus].tone;
  const ftype = fileTypeLabel(document.mimeType);

  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setConfirmOpen(false);
    const result = await deleteDocument(document.id);
    if (result.ok) showSnackbar("Document deleted", { severity: "success" });
    else showSnackbar("Failed to delete document", { severity: "error" });
  };

  const open = () => router.push(`/documents/${document.id}`);

  return (
    <>
      <Card variant="aurora" accent={toneColor(tone)} onClick={open}>
        <Card.Zone>
          <Card.ZoneCat icon={<FileType2 size={13} />}>{ftype}</Card.ZoneCat>
          <ProcessingStatusBadge stage={stage} />
        </Card.Zone>

        <Card.Body>
          <Card.Head>
            <Card.Icon>
              <DocumentIcon
                mimeType={document.mimeType}
                size={22}
                strokeWidth={2}
              />
            </Card.Icon>
            <Card.HeadText>
              <Card.Title title={document.filename}>
                {document.filename}
              </Card.Title>
              {document.fileSize && (
                <Card.Sub>{formatFileSize(document.fileSize)}</Card.Sub>
              )}
            </Card.HeadText>
          </Card.Head>

          <Card.DataRow>
            <Card.DataCell label="Concepts" icon={<Layers size={15} />}>
              {stage === "READY" ? (document.conceptCount ?? 0) : "—"}
            </Card.DataCell>
            <Card.DataCell label="Type" icon={<FileType2 size={14} />}>
              {ftype}
            </Card.DataCell>
          </Card.DataRow>

          {auroraStatus === "failed" && (
            <Card.FailNote icon={<Brain size={14} />}>
              Analysis failed — re-upload to retry
            </Card.FailNote>
          )}
        </Card.Body>

        <Card.Foot>
          <Card.FootLeft>
            <Card.FootDate>
              {formatRelativeDate(document.createdAt)}
            </Card.FootDate>
          </Card.FootLeft>
          <Card.Actions>
            <AuroraIconButton
              ariaLabel="Delete"
              title="Delete"
              onClick={handleDeleteClick}
            >
              <Trash2 size={16} />
            </AuroraIconButton>
            <AuroraIconButton
              ariaLabel="Open"
              title="Open"
              go
              onClick={(e) => {
                e.stopPropagation();
                open();
              }}
            >
              <ArrowRight size={18} />
            </AuroraIconButton>
          </Card.Actions>
        </Card.Foot>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete Document"
        description={
          <>
            Are you sure you want to delete <strong>{document.filename}</strong>
            ? This action cannot be undone.
          </>
        }
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
