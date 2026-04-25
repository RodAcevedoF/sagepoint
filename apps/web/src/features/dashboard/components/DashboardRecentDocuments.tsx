"use client";

import { Box, Typography, Stack, alpha } from "@mui/material";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowRight, FileStack } from "lucide-react";
import { Card, EmptyState } from "@/shared/components";
import { ProcessingStatusBadge } from "@/features/document";
import { palette } from "@/shared/theme";
import type { DocumentDetailDto } from "@/infrastructure/api/documentApi";
import { getMimeIcon, formatRelativeDate } from "../utils/dashboard.utils";

const styles = {
  card: {
    p: 3,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    flex: 1,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    mb: 3,
  },
  title: {
    fontWeight: 600,
  },
  viewAll: {
    color: palette.info.light,
    fontSize: "0.875rem",
    display: "flex",
    alignItems: "center",
    gap: 0.5,
    cursor: "pointer",
    "&:hover": { textDecoration: "underline" },
  },
  docItem: {
    p: 2,
    borderRadius: 2,
    bgcolor: alpha(palette.info.light, 0.05),
    border: `1px solid ${alpha(palette.info.light, 0.1)}`,
    transition: "all 0.2s ease",
    cursor: "pointer",
    "&:hover": {
      bgcolor: alpha(palette.info.light, 0.1),
      borderColor: palette.info.light,
    },
  },
  docIcon: {
    width: 40,
    height: 40,
    borderRadius: 2,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    bgcolor: alpha(palette.info.main, 0.15),
    color: palette.info.light,
  },
};

interface DashboardRecentDocumentsProps {
  documents: DocumentDetailDto[];
}

export function DashboardRecentDocuments({
  documents,
}: DashboardRecentDocumentsProps) {
  const router = useRouter();

  const recentDocs = [...documents]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 4);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.35, ease: "easeOut" }}
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Card variant="glass" hoverable={false} sx={styles.card}>
        <Box sx={styles.header}>
          <Typography variant="h6" sx={styles.title}>
            Recent Documents
          </Typography>
          <Typography
            sx={styles.viewAll}
            onClick={() => router.push("/documents")}
          >
            View all <ArrowRight size={14} />
          </Typography>
        </Box>

        {recentDocs.length === 0 ? (
          <EmptyState
            inline
            title="No documents yet"
            description="Upload a PDF, DOCX, or XLSX to extract concepts and generate roadmaps"
            icon={FileStack}
            actionLabel="Upload document"
            onAction={() => router.push("/documents")}
          />
        ) : (
          <Stack spacing={2}>
            {recentDocs.map((doc) => {
              const Icon = getMimeIcon(doc.mimeType);
              return (
                <Box
                  key={doc.id}
                  sx={styles.docItem}
                  onClick={() => router.push(`/documents/${doc.id}`)}
                >
                  <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                    <Box sx={styles.docIcon}>
                      <Icon size={20} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="subtitle2" fontWeight={600} noWrap>
                        {doc.filename}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mt: 0.5,
                        }}
                      >
                        <ProcessingStatusBadge stage={doc.processingStage} />
                        <Typography variant="caption" color="text.secondary">
                          {formatRelativeDate(doc.createdAt)}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Stack>
        )}
      </Card>
    </motion.div>
  );
}
