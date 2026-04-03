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
import { Map, AlertCircle } from "lucide-react";
import { Card } from "@/common/components";
import { palette } from "@/common/theme";
import { useRoadmapEvents } from "@/common/hooks";
import type { RecentRoadmapItem } from "../types/dashboard.types";
import { formatRelativeDate } from "../utils/dashboard.utils";
import type { RoadmapEventStage } from "@/common/hooks";

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

interface RoadmapActivityCardProps {
  item: RecentRoadmapItem;
  onClick: (id: string) => void;
  onComplete?: () => void;
}

const styles = {
  activityIcon: {
    width: 48,
    height: 48,
    borderRadius: 3,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    bgcolor: alpha(palette.primary.main, 0.15),
    color: palette.primary.light,
    flexShrink: 0,
    border: `1px solid ${alpha(palette.primary.light, 0.2)}`,
  },
  progress: {
    height: 6,
    borderRadius: 3,
    bgcolor: alpha(palette.primary.light, 0.1),
    "& .MuiLinearProgress-bar": {
      borderRadius: 3,
      background: `linear-gradient(90deg, ${palette.primary.main}, ${palette.primary.light})`,
    },
  },
  stepCount: {
    color: palette.text.secondary,
    fontSize: "0.75rem",
    fontWeight: 500,
  },
};

function GeneratingActivityCard({
  item,
  onComplete,
}: {
  item: RecentRoadmapItem;
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

  return (
    <Card
      variant="outlined"
      hoverable={false}
      sx={{
        p: 2,
        height: "auto",
        opacity: 0.85,
      }}
    >
      <Stack direction="row" spacing={2.5} alignItems="center">
        <Box sx={styles.activityIcon}>
          {isFailed ? (
            <AlertCircle size={24} color={palette.error.main} />
          ) : (
            <CircularProgress size={24} thickness={3} />
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
                sx={styles.progress}
              />
              <Typography sx={styles.stepCount}>{label}</Typography>
            </Stack>
          )}
        </Box>
      </Stack>
    </Card>
  );
}

export function RoadmapActivityCard({
  item,
  onClick,
  onComplete,
}: RoadmapActivityCardProps) {
  if (item.generationStatus !== "completed") {
    return <GeneratingActivityCard item={item} onComplete={onComplete} />;
  }

  return (
    <Card
      variant="outlined"
      hoverable={true}
      onClick={() => onClick(item.id)}
      sx={{
        p: 2,
        height: "auto",
        "&:hover": {
          bgcolor: alpha(palette.primary.light, 0.05),
          transform: "translateY(-2px)",
        },
      }}
    >
      <Stack direction="row" spacing={2.5} alignItems="center">
        <Box sx={styles.activityIcon}>
          <Map size={24} />
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
            sx={{ mb: 0.5 }}
          >
            <Typography
              variant="subtitle2"
              fontWeight={700}
              noWrap
              sx={{ maxWidth: "70%", color: palette.text.primary }}
            >
              {item.title}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: palette.text.secondary, fontWeight: 500 }}
            >
              {formatRelativeDate(item.createdAt)}
            </Typography>
          </Stack>

          <Stack spacing={1}>
            <LinearProgress
              variant="determinate"
              value={item.progressPercentage}
              sx={styles.progress}
            />
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography sx={styles.stepCount}>
                {item.completedSteps}/{item.totalSteps} steps
              </Typography>
              <Typography
                variant="caption"
                fontWeight={700}
                color="primary.light"
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
