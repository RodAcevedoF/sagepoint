"use client";

import { useState, useCallback } from "react";
import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import { Upload, FileUp, FileText, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ModalTitle,
  ResourceQuotaBar,
  useModal,
  useSnackbar,
} from "@/shared/components";
import { useUploadDocumentCommand } from "@/application/document";
import { useGetResourceQuotaQuery } from "@/infrastructure/api/userApi";
import { aurora, auroraTint } from "@/shared/theme";

const teal = aurora.teal;
const ready = aurora.status.ready;
const proc = aurora.status.proc;

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
    py: 1,
  },
  dropzone: (active: boolean) => ({
    position: "relative",
    border: `2px dashed ${active ? teal : aurora.line2}`,
    borderRadius: aurora.radii.card,
    p: { xs: 4, md: 7 },
    textAlign: "center",
    cursor: "pointer",
    background: active
      ? `color-mix(in oklch, ${teal} 8%, ${aurora.surface})`
      : aurora.surface,
    transition: "background .25s, border-color .25s, box-shadow .25s",
    "&:hover": {
      borderColor: teal,
      background: `color-mix(in oklch, ${teal} 6%, ${aurora.surface})`,
      boxShadow: `0 0 0 4px ${auroraTint(teal, 0.12)}`,
      "& .upload-icon-box": {
        transform: "scale(1.08) translateY(-3px)",
        boxShadow: `0 0 32px -6px ${auroraTint(teal, 0.6)}`,
      },
    },
  }),
  uploadIcon: {
    width: 80,
    height: 80,
    borderRadius: aurora.radii.md,
    display: "grid",
    placeItems: "center",
    mx: "auto",
    mb: 3,
    background: `color-mix(in oklch, ${teal} 16%, ${aurora.surface2})`,
    border: `1px solid ${auroraTint(teal, 0.32)}`,
    color: teal,
    boxShadow: `0 0 26px -8px ${auroraTint(teal, 0.5)}`,
    transition:
      "transform .35s cubic-bezier(.175,.885,.32,1.275), box-shadow .35s",
  },
  heading: {
    fontFamily: aurora.font.display,
    fontWeight: 800,
    fontSize: "20px",
    letterSpacing: "-0.018em",
    color: aurora.txHi,
    mb: 1,
  },
  body: {
    color: aurora.txMid,
    fontFamily: aurora.font.ui,
    maxWidth: 300,
    mx: "auto",
    mb: 3,
    lineHeight: 1.6,
  },
  metaRow: {
    color: aurora.txLow,
    fontFamily: aurora.font.mono,
    fontSize: "11px",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    display: "flex",
    alignItems: "center",
    gap: 0.75,
  },
  metaDot: {
    width: 4,
    height: 4,
    borderRadius: "50%",
    bgcolor: auroraTint(aurora.txLow, 0.6),
  },
  successWrap: {
    textAlign: "center",
    py: 4,
    px: 2,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  successDisc: (loading: boolean) => ({
    width: 84,
    height: 84,
    borderRadius: "50%",
    display: "grid",
    placeItems: "center",
    mx: "auto",
    mb: 3,
    position: "relative",
    background: loading
      ? `color-mix(in oklch, ${proc} 14%, ${aurora.surface2})`
      : `color-mix(in oklch, ${ready} 14%, ${aurora.surface2})`,
    border: `1px solid ${auroraTint(loading ? proc : ready, 0.32)}`,
    color: loading ? proc : ready,
    boxShadow: `0 0 28px -6px ${auroraTint(loading ? proc : ready, 0.55)}`,
  }),
  successTitle: {
    fontFamily: aurora.font.display,
    fontWeight: 800,
    fontSize: "22px",
    letterSpacing: "-0.018em",
    color: aurora.txHi,
    mb: 1,
  },
  successFile: {
    color: aurora.txMid,
    fontFamily: aurora.font.ui,
  },
};

export function UploadDocumentModal() {
  const { execute, isLoading } = useUploadDocumentCommand();
  const { closeModal } = useModal();
  const { showSnackbar } = useSnackbar();
  const { data: quota } = useGetResourceQuotaQuery();
  const [dragOver, setDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setUploadedFile(file);
      const result = await execute(file);
      if (result.ok) {
        showSnackbar("Document uploaded successfully", { severity: "success" });
        setTimeout(() => closeModal(), 1500);
      } else {
        showSnackbar(
          result.error.tag === "DOCUMENT_LIMIT"
            ? "Not enough tokens. Contact your administrator to get more."
            : "Failed to upload document",
          { severity: "error" },
        );
        setUploadedFile(null);
      }
    },
    [execute, closeModal, showSnackbar],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  return (
    <Box sx={styles.container}>
      <ModalTitle
        eyebrow="Analyze"
        title="Upload Document"
        icon={<FileUp size={20} />}
        tone="concept"
      />

      <AnimatePresence mode="wait">
        {!uploadedFile ? (
          <motion.div
            key="upload-zone"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <Box
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              sx={styles.dropzone(dragOver)}
              onClick={() =>
                document.getElementById("file-upload-input")?.click()
              }
            >
              <Box className="upload-icon-box" sx={styles.uploadIcon}>
                <Upload size={36} />
              </Box>

              <Typography sx={styles.heading}>
                {dragOver ? "Drop it here!" : "Select a document"}
              </Typography>
              <Typography sx={styles.body}>
                Drag and drop your file or click to browse through your device.
              </Typography>

              <Stack
                direction="row"
                spacing={2}
                justifyContent="center"
                alignItems="center"
              >
                <Box sx={styles.metaRow}>
                  <FileText size={14} />
                  PDF · DOCX · XLSX
                </Box>
                <Box sx={styles.metaDot} />
                <Box sx={styles.metaRow}>Max 100MB</Box>
              </Stack>
            </Box>
          </motion.div>
        ) : (
          <motion.div
            key="success-zone"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Box sx={styles.successWrap}>
              <Box sx={styles.successDisc(isLoading)}>
                {isLoading ? (
                  <>
                    <CircularProgress
                      size={84}
                      thickness={2}
                      sx={{ position: "absolute", color: proc }}
                    />
                    <FileUp size={32} />
                  </>
                ) : (
                  <CheckCircle2 size={48} />
                )}
              </Box>
              <Typography sx={styles.successTitle}>
                {isLoading ? "Processing Document" : "Successfully Uploaded"}
              </Typography>
              <Typography sx={styles.successFile}>
                {uploadedFile.name}
              </Typography>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>

      {quota && !uploadedFile && (
        <ResourceQuotaBar
          balance={quota.balance}
          cost={quota.costs.DOCUMENT_UPLOAD}
          costLabel="Uploading a document"
        />
      )}

      <input
        id="file-upload-input"
        type="file"
        hidden
        accept=".pdf,.docx,.xlsx,.png,.jpg,.jpeg,.webp"
        onChange={handleFileInput}
      />
    </Box>
  );
}
