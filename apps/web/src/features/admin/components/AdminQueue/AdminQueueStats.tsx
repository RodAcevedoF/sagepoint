"use client";

import { useState } from "react";
import { Box, Collapse, CircularProgress } from "@mui/material";
import {
  FileText,
  Map,
  Clock,
  Play,
  CheckCircle2,
  XCircle,
  Timer,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  Card,
  SecTitle,
  toneColor,
  type AuroraTone,
} from "@/shared/components";
import { aurora, auroraTint } from "@/shared/theme";
import type {
  QueueStatsResponse,
  QueueInfo,
} from "@/infrastructure/api/adminApi";

interface CountConfig {
  key: keyof QueueInfo["counts"];
  label: string;
  icon: LucideIcon;
  tone: AuroraTone;
}

const countConfigs: ReadonlyArray<CountConfig> = [
  { key: "waiting", label: "Waiting", icon: Clock, tone: "proc" },
  { key: "active", label: "Active", icon: Play, tone: "concept" },
  { key: "completed", label: "Completed", icon: CheckCircle2, tone: "ready" },
  { key: "failed", label: "Failed", icon: XCircle, tone: "fail" },
  { key: "delayed", label: "Delayed", icon: Timer, tone: "teal" },
];

interface QueueConfig {
  key: "documentQueue" | "roadmapQueue";
  label: string;
  icon: LucideIcon;
  tone: AuroraTone;
}

const queues: ReadonlyArray<QueueConfig> = [
  {
    key: "documentQueue",
    label: "Document Processing",
    icon: FileText,
    tone: "ready",
  },
  {
    key: "roadmapQueue",
    label: "Roadmap Generation",
    icon: Map,
    tone: "teal",
  },
];

const queueGridSx = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
  gap: "18px",
} as const;

const queueCardSx = {
  padding: "26px 28px",
} as const;

const queueHeadSx = {
  display: "flex",
  alignItems: "center",
  gap: "13px",
  marginBottom: "20px",
} as const;

const queueIconSx = {
  width: 46,
  height: 46,
  borderRadius: aurora.radii.md,
  display: "grid",
  placeItems: "center",
  background: `color-mix(in oklch, var(--accent) 15%, ${aurora.surface2})`,
  border: "1px solid color-mix(in oklch, var(--accent) 26%, transparent)",
  color: "var(--accent)",
} as const;

const queueNameSx = {
  fontFamily: aurora.font.display,
  fontWeight: 700,
  fontSize: "20px",
  color: aurora.txHi,
  letterSpacing: "-0.01em",
} as const;

const countRowSx = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "10px 0",
  "& + &": {
    borderTop: `1px solid ${aurora.line}`,
  },
} as const;

function CountRow({ config, value }: { config: CountConfig; value: number }) {
  const Icon = config.icon;
  const color = toneColor(config.tone);
  return (
    <Box sx={countRowSx}>
      <Box
        component="span"
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: "11px",
          fontSize: "14.5px",
          color: aurora.tx,
          "& svg": { color },
        }}
      >
        <Icon size={17} />
        {config.label}
      </Box>
      <Box
        component="span"
        sx={{
          fontFamily: aurora.font.mono,
          fontSize: "13px",
          fontWeight: 700,
          minWidth: "38px",
          textAlign: "center",
          padding: "4px 11px",
          borderRadius: aurora.radii.pill,
          background: auroraTint(color, 0.14),
          border: `1px solid ${auroraTint(color, 0.3)}`,
          color,
        }}
      >
        {value}
      </Box>
    </Box>
  );
}

interface QueueCardProps {
  queue: QueueInfo | undefined;
  config: QueueConfig;
}

function QueueCard({ queue, config }: QueueCardProps) {
  const [expanded, setExpanded] = useState(false);
  const Icon = config.icon;
  const failures = queue?.recentFailures ?? [];
  const failCount = failures.length;
  const hasFailures = failCount > 0;

  return (
    <Card
      variant="aurora"
      tone={config.tone}
      hoverable={false}
      withAura={false}
      sx={queueCardSx}
    >
      <Box sx={queueHeadSx}>
        <Box sx={queueIconSx}>
          <Icon size={22} />
        </Box>
        <Box sx={queueNameSx}>{config.label}</Box>
      </Box>

      {!queue ? (
        <Box sx={{ fontSize: "14px", color: aurora.txMid }}>
          No data available
        </Box>
      ) : (
        <>
          {countConfigs.map((c) => (
            <CountRow key={c.key} config={c} value={queue.counts[c.key] ?? 0} />
          ))}

          {hasFailures && (
            <Box sx={{ marginTop: "16px", paddingTop: "6px" }}>
              <Box
                component="button"
                onClick={() => setExpanded((v) => !v)}
                sx={{
                  appearance: "none",
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "9px",
                  fontWeight: 700,
                  fontSize: "14px",
                  color: aurora.status.fail,
                  whiteSpace: "nowrap",
                  transition: "opacity .15s ease",
                  "&:hover": { opacity: 0.85 },
                }}
              >
                Recent Failures ({failCount})
                {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              </Box>
              <Collapse in={expanded}>
                <Box sx={{ marginTop: "10px", display: "grid", gap: "8px" }}>
                  {failures.map((failure, i) => (
                    <Box
                      key={failure.id ?? i}
                      sx={{
                        padding: "11px 13px",
                        borderRadius: aurora.radii.sm,
                        background: auroraTint(aurora.status.fail, 0.08),
                        border: `1px solid ${auroraTint(aurora.status.fail, 0.22)}`,
                        fontSize: "13.5px",
                        color: aurora.status.fail,
                        wordBreak: "break-word",
                      }}
                    >
                      {failure.failedReason || "Unknown error"}
                    </Box>
                  ))}
                </Box>
              </Collapse>
            </Box>
          )}
        </>
      )}
    </Card>
  );
}

interface AdminQueueStatsProps {
  data: QueueStatsResponse | undefined;
  isLoading: boolean;
}

export function AdminQueueStats({ data, isLoading }: AdminQueueStatsProps) {
  return (
    <Box>
      <SecTitle style={{ marginBottom: "14px" }}>Queue Monitor</SecTitle>
      {isLoading && !data ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: "28px" }}>
          <CircularProgress size={24} sx={{ color: aurora.teal }} />
        </Box>
      ) : (
        <Box sx={queueGridSx}>
          {queues.map((q) => (
            <QueueCard key={q.key} queue={data?.[q.key]} config={q} />
          ))}
        </Box>
      )}
    </Box>
  );
}
