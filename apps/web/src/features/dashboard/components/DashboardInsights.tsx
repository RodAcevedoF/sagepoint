"use client";

import { Box, Typography } from "@mui/material";
import { Sparkles, CheckCircle, Target, Layers } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card, EmptyState, MixBar } from "@/shared/components";
import { toneColor, type AuroraTone } from "@/shared/components";
import { aurora, auroraTint } from "@/shared/theme";
import type { InsightsData, UserMetrics } from "../types/dashboard.types";

const cardSx = {
  p: { xs: 2.5, md: "28px 30px 30px" },
  height: "100%",
} as const;

const headerSx = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  mb: "8px",
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

const subSx = {
  fontSize: "13.5px",
  color: aurora.txMid,
  m: "0 0 22px",
} as const;

const pctRowSx = {
  display: "flex",
  alignItems: "baseline",
  gap: "12px",
  flexWrap: "wrap" as const,
} as const;

const pctValueSx = {
  fontFamily: aurora.font.display,
  fontWeight: 800,
  fontSize: { xs: "44px", md: "56px" },
  lineHeight: 1,
  letterSpacing: "-0.03em",
  background: `linear-gradient(120deg, ${aurora.status.concept}, ${aurora.teal})`,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  WebkitTextFillColor: "transparent",
} as const;

const pctTextSx = {
  fontSize: "15px",
  color: aurora.txMid,
} as const;

const mixLabelSx = {
  fontFamily: aurora.font.mono,
  fontSize: "11px",
  fontWeight: 600,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: aurora.txLow,
  m: "26px 0 13px",
} as const;

const miniGridSx = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "12px",
  mt: "24px",
} as const;

const miniCardSx = (color: string) =>
  ({
    p: "15px 15px 16px",
    borderRadius: aurora.radii.md,
    border: `1px solid ${aurora.line}`,
    background: "oklch(0.255 0.024 262 / 0.5)",
    transition: "border-color .15s",
    "&:hover": { borderColor: auroraTint(color, 0.35) },
  }) as const;

const miniIconSx = (color: string) =>
  ({
    width: 32,
    height: 32,
    borderRadius: "9px",
    display: "grid",
    placeItems: "center",
    background: `color-mix(in oklch, ${color} 15%, ${aurora.surface2})`,
    border: `1px solid ${auroraTint(color, 0.26)}`,
    color,
  }) as const;

const miniNumSx = {
  fontFamily: aurora.font.display,
  fontWeight: 800,
  fontSize: "24px",
  color: aurora.txHi,
  mt: "12px",
  lineHeight: 1,
  letterSpacing: "-0.02em",
} as const;

const miniLabelSx = {
  fontFamily: aurora.font.mono,
  fontSize: "9.5px",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: aurora.txLow,
  mt: "6px",
} as const;

interface InsightStat {
  key: string;
  label: string;
  value: number;
  icon: LucideIcon;
  tone: AuroraTone;
}

interface DashboardInsightsProps {
  data: InsightsData;
  overallProgress: number;
  metrics: Pick<UserMetrics, "completedRoadmaps" | "activeRoadmaps">;
}

export function DashboardInsights({
  data,
  overallProgress,
  metrics,
}: DashboardInsightsProps) {
  const { difficultyBreakdown, totalSteps } = data;

  const mini: ReadonlyArray<InsightStat> = [
    {
      key: "mastered",
      label: "Mastered",
      value: metrics.completedRoadmaps,
      icon: CheckCircle,
      tone: "ready",
    },
    {
      key: "inProgress",
      label: "In Progress",
      value: metrics.activeRoadmaps,
      icon: Target,
      tone: "proc",
    },
    {
      key: "totalSteps",
      label: "Total Steps",
      value: totalSteps,
      icon: Layers,
      tone: "concept",
    },
  ];

  const segments = difficultyBreakdown.map((seg) => ({
    key: seg.name,
    count: seg.count,
    color: seg.color,
    label: seg.name,
  }));

  return (
    <Card variant="aurora" hoverable={false} withAura={false} sx={cardSx}>
      <Box sx={headerSx}>
        <Typography component="h2" sx={titleSx}>
          Learning Insights
        </Typography>
        <Box sx={{ color: aurora.teal, display: "flex" }}>
          <Sparkles size={22} />
        </Box>
      </Box>
      <Typography sx={subSx}>Your pace and mastery</Typography>

      {totalSteps === 0 ? (
        <EmptyState
          inline
          icon={Sparkles}
          title="No insights yet"
          description="Complete a few steps to unlock pace and mastery stats"
        />
      ) : (
        <>
          <Box sx={pctRowSx}>
            <Typography component="b" sx={pctValueSx}>
              {overallProgress}%
            </Typography>
            <Typography component="span" sx={pctTextSx}>
              of all steps mastered
            </Typography>
          </Box>

          <Typography sx={mixLabelSx}>Difficulty Mix</Typography>
          <MixBar segments={segments} />

          <Box sx={miniGridSx}>
            {mini.map((m) => {
              const Icon = m.icon;
              const color = toneColor(m.tone);
              return (
                <Box key={m.key} sx={miniCardSx(color)}>
                  <Box sx={miniIconSx(color)}>
                    <Icon size={17} />
                  </Box>
                  <Box sx={miniNumSx}>{m.value}</Box>
                  <Box sx={miniLabelSx}>{m.label}</Box>
                </Box>
              );
            })}
          </Box>
        </>
      )}
    </Card>
  );
}
