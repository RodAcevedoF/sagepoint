"use client";

import { Box, CircularProgress } from "@mui/material";
import { CheckCircle2, Circle, Play, SkipForward, Clock } from "lucide-react";
import { StepStatus, type RoadmapStep } from "@sagepoint/domain";
import { aurora as auroraPalette, auroraTint } from "@/shared/theme";

interface SubConceptItemProps {
  step: RoadmapStep;
  status: StepStatus;
  label: string;
  onToggle?: () => void;
  isLoading?: boolean;
}

const STATUS_ICONS = {
  [StepStatus.COMPLETED]: CheckCircle2,
  [StepStatus.IN_PROGRESS]: Play,
  [StepStatus.SKIPPED]: SkipForward,
  [StepStatus.NOT_STARTED]: Circle,
} as const;

function statusColor(status: StepStatus): string {
  switch (status) {
    case StepStatus.COMPLETED:
      return auroraPalette.status.ready;
    case StepStatus.IN_PROGRESS:
      return auroraPalette.status.proc;
    case StepStatus.SKIPPED:
      return auroraPalette.txLow;
    default:
      return auroraPalette.txMid;
  }
}

function formatDuration(minutes?: number): string {
  if (!minutes) return "";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function SubConceptItem({
  step,
  status,
  label,
  onToggle,
  isLoading,
}: SubConceptItemProps) {
  const color = statusColor(status);
  const StatusIcon = STATUS_ICONS[status];
  const isCompleted = status === StepStatus.COMPLETED;
  const duration = formatDuration(step.estimatedDuration);

  return (
    <Box
      onClick={isLoading ? undefined : onToggle}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "8px 12px",
        borderRadius: auroraPalette.radii.sm,
        cursor: onToggle ? "pointer" : "default",
        userSelect: "none",
        transition: "background .15s",
        "&:hover": onToggle
          ? { background: auroraTint(auroraPalette.teal, 0.06) }
          : undefined,
      }}
    >
      {isLoading ? (
        <CircularProgress size={16} sx={{ color }} />
      ) : (
        <StatusIcon
          size={16}
          color={color}
          fill={status === StepStatus.IN_PROGRESS ? color : "none"}
        />
      )}

      <Box
        component="span"
        sx={{
          flex: "none",
          fontFamily: auroraPalette.font.mono,
          fontSize: "11.5px",
          color: auroraPalette.txLow,
        }}
      >
        {label}
      </Box>

      <Box
        component="span"
        sx={{
          flex: 1,
          fontSize: "14px",
          fontWeight: 500,
          color: isCompleted ? auroraPalette.txMid : auroraPalette.tx,
          textDecoration: isCompleted ? "line-through" : "none",
        }}
      >
        {step.concept.name}
      </Box>

      {step.difficulty && (
        <Box
          component="span"
          sx={{
            padding: "2px 9px",
            borderRadius: auroraPalette.radii.pill,
            fontSize: "10.5px",
            fontWeight: 600,
            background: auroraTint(auroraPalette.txMid, 0.1),
            color: auroraPalette.txMid,
          }}
        >
          {step.difficulty}
        </Box>
      )}

      {duration && (
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            flex: "none",
          }}
        >
          <Clock size={12} color={auroraPalette.txLow} />
          <Box
            component="span"
            sx={{
              fontFamily: auroraPalette.font.mono,
              fontSize: "11px",
              color: auroraPalette.txLow,
            }}
          >
            {duration}
          </Box>
        </Box>
      )}
    </Box>
  );
}
