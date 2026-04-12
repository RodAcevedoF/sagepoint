"use client";

import { lazy, Suspense, useState } from "react";
import { Box, Typography, useTheme, Chip } from "@mui/material";
import { Map, Trash2, Layers, HardDrive, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Button,
  ConfirmDialog,
  Loader,
  useSnackbar,
  useModal,
} from "@/shared/components";
import {
  ButtonVariants,
  ButtonSizes,
  ButtonIconPositions,
} from "@/shared/types";
import { useDeleteDocumentCommand } from "@/application/document";
import { ProcessingStatusBadge } from "./ProcessingStatusBadge";
import { makeStyles } from "./DocumentDetailHero.styles";
import type {
  DocumentDetailDto,
  DocumentSummaryDto,
} from "@/infrastructure/api/documentApi";

const LazyGenerateFromDocumentModal = lazy(() =>
  import("./GenerateFromDocumentModal").then((m) => ({
    default: m.GenerateFromDocumentModal,
  })),
);

const MotionBox = motion.create(Box);

function formatFileSize(bytes?: number): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}

interface DocumentDetailHeroProps {
  document: DocumentDetailDto;
  summary?: DocumentSummaryDto | null;
}

export function DocumentDetailHero({
  document,
  summary,
}: DocumentDetailHeroProps) {
  const theme = useTheme();
  const router = useRouter();
  const { openModal } = useModal();
  const { execute: deleteDocument } = useDeleteDocumentCommand();
  const { showSnackbar } = useSnackbar();
  const styles = makeStyles(theme);

  const isReady = document.processingStage === "READY";
  const fileSize = formatFileSize(document.fileSize);

  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleDeleteConfirm = async () => {
    setConfirmOpen(false);
    try {
      await deleteDocument(document.id);
      showSnackbar("Document deleted", { severity: "success" });
      router.push("/documents");
    } catch {
      showSnackbar("Failed to delete document", { severity: "error" });
    }
  };

  const handleGenerateRoadmap = () => {
    openModal(
      <Suspense fallback={<Loader />}>
        <LazyGenerateFromDocumentModal
          documentId={document.id}
          documentName={document.filename}
        />
      </Suspense>,
      { title: "Generate Roadmap", maxWidth: "sm" },
    );
  };

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      sx={styles.wrapper}
    >
      <Box sx={styles.card}>
        {/* Gradient accent bar */}
        <Box sx={styles.accentBar} />

        {/* Decorative gradient orbs */}
        <Box sx={styles.orbTopRight} />
        <Box sx={styles.orbBottomLeft} />

        <Typography variant="h3" sx={styles.title}>
          {document.filename}
        </Typography>

        <Box sx={styles.chipRow}>
          <ProcessingStatusBadge stage={document.processingStage} />
          {summary?.topicArea && (
            <Chip
              label={summary.topicArea}
              size="small"
              sx={styles.topicChip}
            />
          )}
          {summary?.difficulty && (
            <Chip
              label={summary.difficulty}
              size="small"
              variant="outlined"
              sx={styles.difficultyChip}
            />
          )}
          {isReady &&
            document.conceptCount != null &&
            document.conceptCount > 0 && (
              <Chip
                icon={<Layers size={12} />}
                label={`${document.conceptCount} concepts`}
                size="small"
                sx={styles.conceptChip}
              />
            )}
        </Box>

        {/* Metadata row */}
        <Box sx={styles.metaRow}>
          {fileSize && (
            <Box sx={styles.metaItem}>
              <HardDrive size={16} color={theme.palette.text.secondary} />
              <Typography
                variant="body2"
                sx={{ color: theme.palette.text.secondary }}
              >
                {fileSize}
              </Typography>
            </Box>
          )}
          <Box sx={styles.metaItem}>
            <Calendar size={16} color={theme.palette.text.secondary} />
            <Typography
              variant="body2"
              sx={{ color: theme.palette.text.secondary }}
            >
              Uploaded {formatRelativeDate(document.createdAt)}
            </Typography>
          </Box>
        </Box>

        <Box sx={styles.actionRow}>
          {summary && (
            <Button
              label="Generate Roadmap"
              icon={Map}
              iconPos={ButtonIconPositions.START}
              size={ButtonSizes.MEDIUM}
              onClick={handleGenerateRoadmap}
            />
          )}
          <Button
            label="Delete"
            icon={Trash2}
            iconPos={ButtonIconPositions.START}
            size={ButtonSizes.MEDIUM}
            variant={ButtonVariants.OUTLINED}
            onClick={() => setConfirmOpen(true)}
          />
        </Box>
      </Box>

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
    </MotionBox>
  );
}
