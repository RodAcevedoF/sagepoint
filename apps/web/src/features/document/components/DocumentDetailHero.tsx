"use client";

import { lazy, Suspense, useState } from "react";
import { Box } from "@mui/material";
import { Map, Trash2, Layers, FileText, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Button,
  ConfirmDialog,
  Loader,
  Pill,
  useSnackbar,
  useModal,
} from "@/shared/components";
import {
  ButtonVariants,
  ButtonSizes,
  ButtonIconPositions,
} from "@/shared/types";
import { aurora as auroraPalette, auroraTint } from "@/shared/theme";
import { useDeleteDocumentCommand } from "@/application/document";
import { ProcessingStatusBadge } from "./ProcessingStatusBadge";
import { DocumentFilenameEditor } from "./DocumentFilenameEditor/DocumentFilenameEditor";
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

function fileExtension(filename: string): string | undefined {
  const dot = filename.lastIndexOf(".");
  if (dot < 1 || dot === filename.length - 1) return undefined;
  return filename.slice(dot + 1).toUpperCase();
}

interface DocumentDetailHeroProps {
  document: DocumentDetailDto;
  summary?: DocumentSummaryDto | null;
  editable?: boolean;
}

export function DocumentDetailHero({
  document,
  summary,
  editable = false,
}: DocumentDetailHeroProps) {
  const router = useRouter();
  const { openModal } = useModal();
  const { execute: deleteDocument } = useDeleteDocumentCommand();
  const { showSnackbar } = useSnackbar();

  const isReady = document.processingStage === "READY";
  const fileSize = formatFileSize(document.fileSize);
  const ext = fileExtension(document.filename);

  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleDeleteConfirm = async () => {
    setConfirmOpen(false);
    const result = await deleteDocument(document.id);
    if (result.ok) {
      router.replace("/documents");
      showSnackbar("Document deleted", { severity: "success" });
    } else {
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

  const kickerParts = ["Document", ext, fileSize].filter(Boolean) as string[];

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      sx={{
        position: "relative",
        overflow: "hidden",
        borderRadius: "24px",
        border: `1px solid ${auroraPalette.line}`,
        background:
          "linear-gradient(168deg, oklch(0.235 0.026 262 / 0.92), oklch(0.165 0.026 262 / 0.85))",
        boxShadow: auroraPalette.shadow.card,
        padding: { xs: "28px 22px 26px", md: "38px 40px 34px" },
        "&::before": {
          content: '""',
          position: "absolute",
          inset: "0 0 auto 0",
          height: "4px",
          background: `linear-gradient(90deg, ${auroraPalette.teal}, ${auroraPalette.status.concept} 70%, ${auroraPalette.status.enrich})`,
        },
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          top: "-30%",
          right: "-6%",
          width: "46%",
          height: "90%",
          background: `radial-gradient(closest-side, ${auroraTint(auroraPalette.status.ready, 0.24)}, transparent)`,
          filter: "blur(26px)",
          opacity: 0.55,
          pointerEvents: "none",
        }}
      />

      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          width: "fit-content",
          alignItems: "center",
          gap: "9px",
          whiteSpace: "nowrap",
          marginBottom: "16px",
          fontFamily: auroraPalette.font.mono,
          fontSize: "11.5px",
          fontWeight: 600,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: auroraPalette.txLow,
        }}
      >
        <Box
          component="span"
          sx={{
            width: "30px",
            height: "30px",
            borderRadius: "9px",
            display: "grid",
            placeItems: "center",
            background: `color-mix(in oklch, ${auroraPalette.teal} 14%, ${auroraPalette.surface2})`,
            border: `1px solid ${auroraTint(auroraPalette.teal, 0.24)}`,
            color: auroraPalette.teal,
          }}
        >
          <FileText size={16} />
        </Box>
        {kickerParts.join(" · ")}
      </Box>

      <DocumentFilenameEditor
        documentId={document.id}
        filename={document.filename}
        editable={editable}
      />

      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "10px",
          marginTop: "20px",
        }}
      >
        <ProcessingStatusBadge stage={document.processingStage} />
        {summary?.topicArea && <Pill tone="teal">{summary.topicArea}</Pill>}
        {summary?.difficulty && <Pill tone="proc">{summary.difficulty}</Pill>}
        {isReady &&
          document.conceptCount != null &&
          document.conceptCount > 0 && (
            <Pill tone="concept" icon={<Layers size={14} />}>
              {document.conceptCount} concepts
            </Pill>
          )}
      </Box>

      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          marginTop: "16px",
          fontFamily: auroraPalette.font.mono,
          fontSize: "13px",
          color: auroraPalette.txLow,
          whiteSpace: "nowrap",
        }}
      >
        <Calendar size={14} />
        Uploaded {formatRelativeDate(document.createdAt)}
      </Box>

      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexWrap: "wrap",
          gap: "12px",
          marginTop: "28px",
        }}
      >
        {summary && (
          <Button
            label="Generate Roadmap"
            icon={Map}
            iconPos={ButtonIconPositions.START}
            size={ButtonSizes.MEDIUM}
            variant={ButtonVariants.AURORA}
            onClick={handleGenerateRoadmap}
          />
        )}
        <Button
          label="Delete"
          icon={Trash2}
          iconPos={ButtonIconPositions.START}
          size={ButtonSizes.MEDIUM}
          variant={ButtonVariants.AURORA_OUTLINE}
          onClick={() => setConfirmOpen(true)}
          sx={{
            color: auroraPalette.status.fail,
            borderColor: auroraTint(auroraPalette.status.fail, 0.3),
            "&:hover": {
              background: auroraTint(auroraPalette.status.fail, 0.12),
              borderColor: auroraTint(auroraPalette.status.fail, 0.5),
            },
          }}
        />
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
