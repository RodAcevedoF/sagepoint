"use client";

import { Box, Typography, Chip, useTheme } from "@mui/material";
import { CheckCircle2, Circle, Play, SkipForward, Clock } from "lucide-react";
import { StepStatus, type RoadmapStep } from "@sagepoint/domain";
import { makeStyles, getStatusColor } from "./SubConceptItem.styles";

interface SubConceptItemProps {
  step: RoadmapStep;
  status: StepStatus;
  label: string;
}

const STATUS_ICONS = {
  [StepStatus.COMPLETED]: CheckCircle2,
  [StepStatus.IN_PROGRESS]: Play,
  [StepStatus.SKIPPED]: SkipForward,
  [StepStatus.NOT_STARTED]: Circle,
} as const;

function formatDuration(minutes?: number): string {
  if (!minutes) return "";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function SubConceptItem({ step, status, label }: SubConceptItemProps) {
  const theme = useTheme();
  const styles = makeStyles(theme, status);
  const statusColor = getStatusColor(theme, status);
  const StatusIcon = STATUS_ICONS[status];
  const duration = formatDuration(step.estimatedDuration);

  return (
    <Box sx={styles.container}>
      <StatusIcon
        size={16}
        color={statusColor}
        fill={status === StepStatus.IN_PROGRESS ? statusColor : "none"}
      />

      <Typography variant="body2" sx={styles.label}>
        {label}
      </Typography>

      <Typography variant="body2" sx={styles.name}>
        {step.concept.name}
      </Typography>

      {step.difficulty && (
        <Chip size="small" label={step.difficulty} sx={styles.difficultyChip} />
      )}

      {duration && (
        <Box sx={styles.durationContainer}>
          <Clock size={12} color={theme.palette.text.secondary} />
          <Typography variant="caption" sx={styles.durationText}>
            {duration}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
