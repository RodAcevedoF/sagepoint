"use client";

import { createElement, useState } from "react";
import { Box, Typography, IconButton, alpha, useTheme } from "@mui/material";
import { Trash2, ArrowRight, Layers, HardDrive } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, ConfirmDialog, useSnackbar } from "@/shared/components";
import { useDocumentEvents, useAppDispatch } from "@/shared/hooks";
import { useDeleteDocumentCommand } from "@/application/document";
import { documentApi } from "@/infrastructure/api/documentApi";
import { ProcessingStatusBadge } from "./ProcessingStatusBadge";
import { makeStyles } from "./DocumentCard.styles";
import type { DocumentDetailDto } from "@/infrastructure/api/documentApi";
import { ProcessingStage } from "@sagepoint/domain";
import {
  isDocumentProcessing,
  getDocumentIcon,
  formatFileSize,
  formatRelativeDate,
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

const stageColorMap: Record<string, string> = {
  UPLOADED: "text.disabled",
  PARSING: "info",
  ANALYZING: "warning",
  READY: "success",
};

interface DocumentCardProps {
  document: DocumentDetailDto;
}

const sseStageMap: Record<string, ProcessingStage> = {
  parsing: ProcessingStage.PARSING,
  analyzing: ProcessingStage.ANALYZING,
  summarized: ProcessingStage.SUMMARIZED,
  ready: ProcessingStage.READY,
};

export function DocumentCard({ document }: DocumentCardProps) {
  const theme = useTheme();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { execute: deleteDocument } = useDeleteDocumentCommand();
  const { showSnackbar } = useSnackbar();

  const isProcessing = isDocumentProcessing(document.status);
  const { status: sseStatus, stage: sseStage } = useDocumentEvents(
    isProcessing ? document.id : null,
  );

  if (sseStatus === "completed") {
    dispatch(
      documentApi.util.invalidateTags([{ type: "Document", id: "LIST" }]),
    );
  }

  const stage: ProcessingStage =
    (sseStage && sseStageMap[sseStage]) || document.processingStage;
  const colorKey = stageColorMap[stage] ?? "primary";
  const paletteColors: Record<string, string> = {
    info: theme.palette.info.main,
    warning: theme.palette.warning.main,
    success: theme.palette.success.main,
    primary: theme.palette.primary.main,
  };
  const stageColor =
    colorKey === "text.disabled"
      ? alpha(theme.palette.text.secondary, 0.4)
      : (paletteColors[colorKey] ?? theme.palette.primary.main);

  const styles = makeStyles(stageColor, theme);

  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setConfirmOpen(false);
    try {
      await deleteDocument(document.id);
      showSnackbar("Document deleted", { severity: "success" });
    } catch {
      showSnackbar("Failed to delete document", { severity: "error" });
    }
  };

  return (
    <Box
      onClick={() => router.push(`/documents/${document.id}`)}
      sx={styles.card}
    >
      <Card
        variant="glass"
        hoverable={false}
        sx={{ borderRadius: "9px", height: "100%", cursor: "pointer" }}
      >
        <Card.Content>
          <Box sx={styles.header}>
            <Box sx={styles.iconBox}>
              <DocumentIcon
                mimeType={document.mimeType}
                size={22}
                strokeWidth={2}
              />
            </Box>
            <Box sx={styles.titleContainer}>
              <Typography
                variant="subtitle1"
                sx={styles.title}
                title={document.filename}
              >
                {document.filename}
              </Typography>
              <ProcessingStatusBadge stage={stage} />
            </Box>
            <IconButton
              size="small"
              onClick={handleDeleteClick}
              className="delete-btn"
              sx={styles.deleteButton}
            >
              <Trash2 size={18} />
            </IconButton>
          </Box>

          <Box sx={styles.statsRow}>
            {document.fileSize && (
              <Box sx={styles.statItem}>
                <HardDrive size={16} />
                <Typography variant="caption" sx={styles.statText}>
                  {formatFileSize(document.fileSize)}
                </Typography>
              </Box>
            )}
            {stage === "READY" &&
              document.conceptCount &&
              document.conceptCount > 0 && (
                <Box sx={styles.statItem}>
                  <Layers size={16} />
                  <Typography variant="caption" sx={styles.statText}>
                    {document.conceptCount} concepts
                  </Typography>
                </Box>
              )}
          </Box>
        </Card.Content>

        <Card.Footer sx={styles.footer}>
          <Box sx={styles.footerContent}>
            <Typography variant="caption" sx={styles.dateText}>
              {formatRelativeDate(document.createdAt)}
            </Typography>
            <Box component="span" className="arrow-icon" sx={styles.arrowIcon}>
              <ArrowRight size={20} />
            </Box>
          </Box>
        </Card.Footer>
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
    </Box>
  );
}
