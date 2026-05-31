"use client";

import { useEffect, useRef } from "react";
import {
  Box,
  Typography,
  LinearProgress,
  Stack,
  CircularProgress,
} from "@mui/material";
import { Map, AlertCircle, Trophy, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/shared/components";
import { aurora, auroraTint } from "@/shared/theme";
import { useRoadmapEvents } from "@/shared/hooks";
import type { RoadmapItem } from "../types/dashboard.types";
import { formatRelativeDate } from "../utils/dashboard.utils";
import { type ItemColor } from "../constants";
import { pickRoadmapColor } from "./DashboardRoadmaps/categoryIcon";
import type { RoadmapEventStage } from "@/shared/hooks";

const STAGE_LABELS: Record<string, string> = {
  concepts: "Generating concepts...",
  "learning-path": "Building learning path...",
  resources: "Discovering resources...",
  done: "Finishing up...",
};

function stageProgress(stage: RoadmapEventStage | null): number {
  switch (stage) {
    case "concepts":
      return 25;
    case "learning-path":
      return 50;
    case "resources":
      return 75;
    case "done":
      return 100;
    default:
      return 10;
  }
}

export interface RoadmapCardProps {
  item: RoadmapItem;
  index: number;
  onClick: (id: string) => void;
  onComplete?: () => void;
}

const iconChip = (color: string) => ({
  width: 48,
  height: 48,
  borderRadius: aurora.radii.md,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: `color-mix(in oklch, ${color} 18%, ${aurora.surface2})`,
  color,
  flexShrink: 0,
  border: `1px solid ${auroraTint(color, 0.3)}`,
  boxShadow: `0 0 18px -4px ${auroraTint(color, 0.6)}`,
});

const stepCountSx = {
  color: aurora.txMid,
  fontSize: "0.75rem",
  fontWeight: 500,
};

const donePillSx = (color: string) => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 0.5,
  px: 1,
  py: 0.25,
  borderRadius: aurora.radii.pill,
  fontSize: "0.7rem",
  fontWeight: 700,
  textTransform: "uppercase" as const,
  letterSpacing: "0.04em",
  color,
  background: auroraTint(color, 0.18),
  border: `1px solid ${auroraTint(color, 0.3)}`,
});

const progressBarSx = (color: string) => ({
  height: 6,
  borderRadius: 3,
  bgcolor: auroraTint(color, 0.12),
  "& .MuiLinearProgress-bar": {
    borderRadius: 3,
    background: `linear-gradient(90deg, ${color}, ${auroraTint(color, 0.7)})`,
  },
});

const cardBaseSx = (color: string) => ({
  p: 2,
  height: "auto",
  borderRadius: aurora.radii.md,
  background: `color-mix(in oklch, ${color} 6%, oklch(0.235 0.026 262 / 0.65))`,
  border: `1px solid ${auroraTint(color, 0.22)}`,
  transition: "background-color .2s, transform .2s, border-color .2s",
});

const cardHoverSx = (color: string) => ({
  background: `color-mix(in oklch, ${color} 12%, oklch(0.235 0.026 262 / 0.7))`,
  transform: "translateY(-2px)",
  borderColor: auroraTint(color, 0.4),
});

function GeneratingCard({
  item,
  onComplete,
}: {
  item: RoadmapItem;
  onComplete?: () => void;
}) {
  const isGenerating =
    item.generationStatus === "pending" ||
    item.generationStatus === "processing";
  const isFailed = item.generationStatus === "failed";
  const hasNotified = useRef(false);

  const { status, stage } = useRoadmapEvents(isGenerating ? item.id : null);

  useEffect(() => {
    if (status === "completed" && !hasNotified.current) {
      hasNotified.current = true;
      onComplete?.();
    }
  }, [status, onComplete]);

  const label = (stage && STAGE_LABELS[stage]) || "Starting...";
  const progress = stageProgress(stage);
  const accent = isFailed ? aurora.status.fail : aurora.status.proc;

  return (
    <Card variant="outlined" hoverable={false} sx={cardBaseSx(accent)}>
      <Stack direction="row" spacing={2.5} alignItems="center">
        <Box sx={iconChip(accent)}>
          {isFailed ? (
            <AlertCircle size={24} />
          ) : (
            <CircularProgress size={24} thickness={3} sx={{ color: accent }} />
          )}
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="subtitle2"
            fontWeight={700}
            noWrap
            sx={{ mb: 0.5, color: aurora.txHi }}
          >
            {item.title}
          </Typography>
          {isFailed ? (
            <Typography variant="caption" sx={{ color: aurora.status.fail }}>
              Generation failed
            </Typography>
          ) : (
            <Stack spacing={1}>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={progressBarSx(accent)}
              />
              <Typography sx={stepCountSx}>{label}</Typography>
            </Stack>
          )}
        </Box>
      </Stack>
    </Card>
  );
}

function CompletedCard({
  item,
  color,
  onClick,
}: {
  item: RoadmapItem;
  color: ItemColor;
  onClick: (id: string) => void;
}) {
  const isDone = item.progressPercentage >= 100;
  const StatusIcon: LucideIcon = isDone
    ? Trophy
    : item.progressPercentage > 0
      ? Map
      : Sparkles;
  const accent = isDone ? aurora.status.proc : color.main;

  const activeAt = item.lastActivityAt ?? item.createdAt;
  const dateLabel = item.lastActivityAt ? "Last active" : "Created";

  return (
    <Card
      variant="outlined"
      hoverable={true}
      onClick={() => onClick(item.id)}
      sx={{
        ...cardBaseSx(accent),
        "&:hover": cardHoverSx(accent),
      }}
    >
      <Stack direction="row" spacing={2.5} alignItems="center">
        <Box sx={iconChip(accent)}>
          <StatusIcon size={22} strokeWidth={2.2} />
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
            sx={{ mb: 0.75 }}
          >
            <Typography
              variant="subtitle2"
              fontWeight={700}
              noWrap
              sx={{ maxWidth: "65%", color: aurora.txHi }}
            >
              {item.title}
            </Typography>
            <Stack alignItems="flex-end" spacing={0.4}>
              {isDone && (
                <Box sx={donePillSx(aurora.status.proc)}>
                  <Trophy size={11} strokeWidth={2.6} />
                  Done
                </Box>
              )}
              <Typography
                variant="caption"
                sx={{
                  color: aurora.txLow,
                  fontFamily: aurora.font.mono,
                  fontWeight: 500,
                }}
              >
                {dateLabel} · {formatRelativeDate(activeAt)}
              </Typography>
            </Stack>
          </Stack>

          <Stack spacing={1}>
            <LinearProgress
              variant="determinate"
              value={item.progressPercentage}
              sx={progressBarSx(accent)}
            />
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography sx={stepCountSx}>
                {item.completedSteps}/{item.totalSteps} steps
              </Typography>
              <Typography
                variant="caption"
                fontWeight={800}
                sx={{ color: accent, fontFamily: aurora.font.mono }}
              >
                {Math.round(item.progressPercentage)}%
              </Typography>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Card>
  );
}

export function RoadmapCard({
  item,
  index,
  onClick,
  onComplete,
}: RoadmapCardProps) {
  if (item.generationStatus !== "completed") {
    return <GeneratingCard item={item} onComplete={onComplete} />;
  }
  return (
    <CompletedCard
      item={item}
      color={pickRoadmapColor(index)}
      onClick={onClick}
    />
  );
}
