"use client";

import {
  Box,
  Typography,
  CircularProgress,
  Chip,
  LinearProgress,
  alpha,
  useTheme,
} from "@mui/material";
import { AlertCircle } from "lucide-react";
import { useWatchGenerationCommand } from "@/application/roadmap";
import { makeStyles } from "./GeneratingCard.styles";

import type { UserRoadmapDto } from "@/infrastructure/api/roadmapApi";
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

interface GeneratingCardProps {
  data: UserRoadmapDto;
}

export function GeneratingCard({ data }: GeneratingCardProps) {
  const theme = useTheme();
  const { roadmap } = data;
  const isFailed = roadmap.generationStatus === "failed";

  const { stage } = useWatchGenerationCommand(isFailed ? null : roadmap.id);

  const styles = makeStyles(isFailed, theme);
  const progress = stageProgress(stage);
  const label = (stage && STAGE_LABELS[stage]) || "Starting...";

  return (
    <Box sx={styles.container}>
      {isFailed ? (
        <AlertCircle size={28} color={theme.palette.error.main} />
      ) : (
        <CircularProgress size={28} thickness={3} />
      )}
      <Typography variant="subtitle2" sx={styles.title}>
        {roadmap.title}
      </Typography>
      <Chip size="small" label={isFailed ? "Failed" : label} sx={styles.chip} />
      {!isFailed && (
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            width: "100%",
            height: 4,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            "& .MuiLinearProgress-bar": {
              borderRadius: 2,
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.info.main})`,
            },
          }}
        />
      )}
      {isFailed && roadmap.errorMessage && (
        <Typography variant="caption" color="text.secondary">
          {roadmap.errorMessage}
        </Typography>
      )}
    </Box>
  );
}
