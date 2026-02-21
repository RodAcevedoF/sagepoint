"use client";

import { Box, Typography, Stack, alpha } from "@mui/material";
import { useRouter } from "next/navigation";
import { FileText, FileSpreadsheet, FileImage, FileType, File, ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/common/components";
import { ProcessingStatusBadge } from "@/features/document";
import { palette } from "@/common/theme";
import type { DocumentDetailDto } from "@/infrastructure/api/documentApi";

// ============================================================================
// Helpers
// ============================================================================

function getMimeIcon(mimeType?: string): LucideIcon {
  if (!mimeType) return File;
  if (mimeType.includes("pdf")) return FileText;
  if (mimeType.includes("spreadsheet") || mimeType.includes("xlsx")) return FileSpreadsheet;
  if (mimeType.startsWith("image/")) return FileImage;
  if (mimeType.includes("word") || mimeType.includes("docx")) return FileType;
  return File;
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

// ============================================================================
// Styles
// ============================================================================

const styles = {
  card: {
    p: 3,
    height: "100%",
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

// ============================================================================
// Component
// ============================================================================

interface DashboardRecentDocumentsProps {
  documents: DocumentDetailDto[];
}

export function DashboardRecentDocuments({ documents }: DashboardRecentDocumentsProps) {
  const router = useRouter();

  const recentDocs = [...documents]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  return (
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
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
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
    </Card>
  );
}
