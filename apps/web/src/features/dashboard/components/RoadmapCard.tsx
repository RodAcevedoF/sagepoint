"use client";

import { useEffect, useRef } from "react";
import {
  Box,
  Typography,
  LinearProgress,
  Stack,
  CircularProgress,
  alpha,
} from "@mui/material";
import { Map, AlertCircle, Trophy, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/shared/components";
import { palette } from "@/shared/theme";
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
  borderRadius: "12px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  bgcolor: alpha(color, 0.16),
  color,
  flexShrink: 0,
  border: `1px solid ${alpha(color, 0.32)}`,
  boxShadow: `0 0 14px ${alpha(color, 0.25)}`,
});

const stepCountSx = {
  color: palette.text.secondary,
  fontSize: "0.75rem",
  fontWeight: 500,
};

const donePillSx = {
  display: "inline-flex",
  alignItems: "center",
  gap: 0.5,
  px: 1,
  py: 0.25,
  borderRadius: "999px",
  fontSize: "0.7rem",
  fontWeight: 700,
  textTransform: "uppercase" as const,
  letterSpacing: "0.04em",
};

const progressBarSx = (color: string) => ({
  height: 6,
  borderRadius: 3,
  bgcolor: alpha(color, 0.12),
  "& .MuiLinearProgress-bar": {
    borderRadius: 3,
    background: `linear-gradient(90deg, ${color}, ${alpha(color, 0.65)})`,
  },
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
  const accent = isFailed ? palette.error.light : palette.warning.light;

  return (
    <Card
      variant="outlined"
      hoverable={false}
      sx={{
        p: 2,
        height: "auto",
        opacity: 0.92,
        bgcolor: alpha(accent, 0.05),
        borderColor: alpha(accent, 0.25),
      }}
    >
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
            sx={{ mb: 0.5, color: palette.text.primary }}
          >
            {item.title}
          </Typography>
          {isFailed ? (
            <Typography variant="caption" color="error.main">
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
  const accent = isDone ? palette.warning.light : color.light;
  const accentMain = isDone ? palette.warning.main : color.main;

  const activeAt = item.lastActivityAt ?? item.createdAt;
  const dateLabel = item.lastActivityAt ? "Last active" : "Created";

  return (
    <Card
      variant="outlined"
      hoverable={true}
      onClick={() => onClick(item.id)}
      sx={{
        p: 2,
        height: "auto",
        bgcolor: alpha(accentMain, 0.06),
        borderColor: alpha(accentMain, 0.25),
        transition: "background-color .2s, transform .2s",
        "&:hover": {
          bgcolor: alpha(accentMain, 0.12),
          transform: "translateY(-2px)",
        },
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
              sx={{ maxWidth: "65%", color: palette.text.primary }}
            >
              {item.title}
            </Typography>
            <Stack alignItems="flex-end" spacing={0.4}>
              {isDone && (
                <Box
                  sx={{
                    ...donePillSx,
                    color: palette.warning.light,
                    bgcolor: alpha(palette.warning.main, 0.18),
                  }}
                >
                  <Trophy size={11} strokeWidth={2.6} />
                  Done
                </Box>
              )}
              <Typography
                variant="caption"
                sx={{ color: palette.text.secondary, fontWeight: 500 }}
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
                sx={{ color: accent }}
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
