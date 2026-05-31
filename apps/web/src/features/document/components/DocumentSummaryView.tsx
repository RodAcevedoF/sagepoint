"use client";

import { Box } from "@mui/material";
import { BookOpen, Lightbulb } from "lucide-react";
import { Card, Pill } from "@/shared/components";
import { aurora as auroraPalette, auroraTint } from "@/shared/theme";
import type { DocumentSummaryDto } from "@/infrastructure/api/documentApi";

interface DocumentSummaryViewProps {
  summary: DocumentSummaryDto;
}

export function DocumentSummaryView({ summary }: DocumentSummaryViewProps) {
  return (
    <Card variant="aurora" tone="teal" hoverable={false} withAura={false}>
      <Card.Body
        sx={{ padding: { xs: "22px 24px 26px", md: "30px 34px 32px" } }}
      >
        <Card.Head sx={{ alignItems: "center", marginBottom: "22px" }}>
          <Card.Icon>
            <BookOpen size={22} />
          </Card.Icon>
          <Card.Title
            sx={{
              fontSize: "23px",
              WebkitLineClamp: "unset",
              display: "block",
              overflow: "visible",
            }}
          >
            Summary
          </Card.Title>
        </Card.Head>

        <Box sx={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <Pill tone="teal">{summary.topicArea}</Pill>
          {summary.difficulty && <Pill tone="proc">{summary.difficulty}</Pill>}
          {summary.estimatedReadTime && (
            <Pill tone="concept">{summary.estimatedReadTime} min read</Pill>
          )}
        </Box>

        <Box
          component="p"
          sx={{
            fontSize: "16px",
            lineHeight: 1.68,
            color: auroraPalette.tx,
            maxWidth: "78ch",
            textWrap: "pretty",
            margin: 0,
          }}
        >
          {summary.overview}
        </Box>

        <Box
          component="p"
          sx={{
            fontFamily: auroraPalette.font.mono,
            fontSize: "11.5px",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: auroraPalette.txLow,
            fontWeight: 600,
            margin: 0,
          }}
        >
          Key Points
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: "11px" }}>
          {summary.keyPoints.map((point, i) => (
            <Box
              key={i}
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: "13px",
                padding: "15px 18px",
                borderRadius: auroraPalette.radii.md,
                background: "oklch(0.27 0.022 262 / 0.4)",
                border: `1px solid ${auroraPalette.line}`,
                fontSize: "15px",
                lineHeight: 1.5,
                color: auroraPalette.tx,
                transition: "border-color .15s, background .15s",
                "&:hover": {
                  borderColor: auroraTint(auroraPalette.status.proc, 0.35),
                  background: "oklch(0.27 0.022 262 / 0.6)",
                },
              }}
            >
              <Box
                component="span"
                sx={{
                  flex: "none",
                  width: "30px",
                  height: "30px",
                  borderRadius: "9px",
                  display: "grid",
                  placeItems: "center",
                  background: auroraTint(auroraPalette.status.proc, 0.13),
                  border: `1px solid ${auroraTint(auroraPalette.status.proc, 0.3)}`,
                  color: auroraPalette.status.proc,
                }}
              >
                <Lightbulb size={16} />
              </Box>
              {point}
            </Box>
          ))}
        </Box>
      </Card.Body>
    </Card>
  );
}
