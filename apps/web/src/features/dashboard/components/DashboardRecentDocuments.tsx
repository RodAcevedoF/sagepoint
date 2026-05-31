"use client";

import { Box, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { ArrowRight, FileStack } from "lucide-react";
import { Card, EmptyState } from "@/shared/components";
import { ProcessingStatusBadge } from "@/features/document";
import { aurora, auroraTint } from "@/shared/theme";
import type { DocumentDetailDto } from "@/infrastructure/api/documentApi";
import { getMimeIcon, formatRelativeDate } from "../utils/dashboard.utils";

const cardSx = {
  p: { xs: 2.5, md: "28px 30px 30px" },
  height: "100%",
} as const;

const headerSx = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  mb: "20px",
  gap: "14px",
} as const;

const titleSx = {
  fontFamily: aurora.font.display,
  fontWeight: 700,
  fontSize: "22px",
  color: aurora.txHi,
  letterSpacing: "-0.015em",
  m: 0,
} as const;

const viewAllSx = {
  display: "inline-flex",
  alignItems: "center",
  gap: "7px",
  fontSize: "14px",
  fontWeight: 600,
  color: aurora.status.concept,
  cursor: "pointer",
  whiteSpace: "nowrap",
  "&:hover": { color: auroraTint(aurora.status.concept, 0.85) },
} as const;

const listSx = {
  display: "flex",
  flexDirection: "column",
  gap: "12px",
} as const;

const docRowSx = {
  display: "flex",
  alignItems: "center",
  gap: "15px",
  padding: "16px 18px",
  borderRadius: aurora.radii.md,
  border: `1px solid ${aurora.line}`,
  background: "oklch(0.255 0.024 262 / 0.45)",
  cursor: "pointer",
  transition: "border-color .15s, background .15s",
  "&:hover": {
    borderColor: auroraTint(aurora.status.concept, 0.35),
    background: "oklch(0.255 0.024 262 / 0.8)",
  },
  "&:hover .doc-go": { color: aurora.status.concept },
} as const;

const docIconSx = {
  flex: "none",
  width: 46,
  height: 46,
  borderRadius: "12px",
  display: "grid",
  placeItems: "center",
  background: auroraTint(aurora.status.concept, 0.13),
  border: `1px solid ${auroraTint(aurora.status.concept, 0.26)}`,
  color: aurora.status.concept,
} as const;

const docNameSx = {
  fontWeight: 700,
  fontSize: "15px",
  color: aurora.txHi,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
} as const;

const docMetaSx = {
  display: "flex",
  alignItems: "center",
  gap: "11px",
  mt: "8px",
} as const;

const docTimeSx = {
  fontFamily: aurora.font.mono,
  fontSize: "12px",
  color: aurora.txLow,
} as const;

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
    .slice(0, 3);

  return (
    <Card variant="aurora" hoverable={false} withAura={false} sx={cardSx}>
      <Box sx={headerSx}>
        <Typography component="h2" sx={titleSx}>
          Recent Documents
        </Typography>
        <Box sx={viewAllSx} onClick={() => router.push("/documents")}>
          View all <ArrowRight size={15} />
        </Box>
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
        <Box sx={listSx}>
          {recentDocs.map((doc) => {
            const Icon = getMimeIcon(doc.mimeType);
            return (
              <Box
                key={doc.id}
                sx={docRowSx}
                onClick={() => router.push(`/documents/${doc.id}`)}
              >
                <Box sx={docIconSx}>
                  <Icon size={22} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={docNameSx}>{doc.filename}</Box>
                  <Box sx={docMetaSx}>
                    <ProcessingStatusBadge stage={doc.processingStage} />
                    <Typography sx={docTimeSx}>
                      {formatRelativeDate(doc.createdAt)}
                    </Typography>
                  </Box>
                </Box>
                <Box
                  className="doc-go"
                  sx={{ flex: "none", color: aurora.txLow }}
                >
                  <ArrowRight size={18} />
                </Box>
              </Box>
            );
          })}
        </Box>
      )}
    </Card>
  );
}
