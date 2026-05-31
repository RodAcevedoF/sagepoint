"use client";

import { Box, CircularProgress, Tooltip } from "@mui/material";
import {
  Clock,
  ChevronDown,
  PlayCircle,
  CheckCircle2,
  SkipForward,
  FileText,
  GitBranch,
} from "lucide-react";
import { motion } from "framer-motion";
import { StepStatus, type RoadmapStep } from "@sagepoint/domain";
import { Pill } from "@/shared/components";
import { aurora as auroraPalette, auroraTint, palette } from "@/shared/theme";
import type { AuroraDifficulty } from "@/shared/components/ui/Aurora/tones";

const MotionBox = motion.create(Box);

interface StepHeaderProps {
  step: RoadmapStep;
  status: StepStatus;
  expanded: boolean;
  onToggle: () => void;
  onStatusChange: (status: StepStatus) => void;
  isLoading: boolean;
  parentDocumentId?: string;
  quizReady?: boolean;
  isSubConcept?: boolean;
  isOwner: boolean;
}

function formatDuration(minutes?: number): string {
  if (!minutes) return "";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

function getNextAction(status: StepStatus) {
  switch (status) {
    case StepStatus.NOT_STARTED:
    case StepStatus.SKIPPED:
      return {
        status: StepStatus.IN_PROGRESS,
        label: "Start",
        icon: PlayCircle,
      };
    case StepStatus.IN_PROGRESS:
      return {
        status: StepStatus.COMPLETED,
        label: "Take quiz to complete",
        icon: CheckCircle2,
      };
    default:
      return null;
  }
}

const DIFFICULTIES: ReadonlySet<string> = new Set<AuroraDifficulty>([
  "beginner",
  "intermediate",
  "advanced",
  "expert",
]);

function isAuroraDifficulty(value: string): value is AuroraDifficulty {
  return DIFFICULTIES.has(value);
}

export function StepHeader({
  step,
  status,
  expanded,
  onToggle,
  onStatusChange,
  isLoading,
  parentDocumentId,
  quizReady,
  isSubConcept = false,
  isOwner,
}: StepHeaderProps) {
  const nextAction = getNextAction(status);
  const canSkip =
    status !== StepStatus.SKIPPED && status !== StepStatus.COMPLETED;
  const isExternal =
    parentDocumentId &&
    step.concept.documentId &&
    step.concept.documentId !== parentDocumentId;

  const difficulty =
    step.difficulty && isAuroraDifficulty(step.difficulty)
      ? step.difficulty
      : null;
  const difficultyColor = difficulty
    ? auroraPalette.difficulty[difficulty]
    : null;

  return (
    <Box
      onClick={onToggle}
      sx={{
        position: "relative",
        zIndex: 1,
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        padding: { xs: "16px 18px", md: "22px 24px" },
        cursor: "pointer",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: "16px",
        }}
      >
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            alignItems: "center",
            gap: "11px",
            flexWrap: "wrap",
          }}
        >
          <Box
            component="h3"
            sx={{
              margin: 0,
              fontFamily: auroraPalette.font.display,
              fontWeight: 700,
              fontSize: { xs: "18px", md: "20px" },
              color: auroraPalette.txHi,
              letterSpacing: "-0.012em",
            }}
          >
            {step.concept.name}
          </Box>
          <Box
            component="span"
            sx={{
              fontFamily: auroraPalette.font.mono,
              fontSize: "12.5px",
              color: auroraPalette.txLow,
            }}
          >
            #{step.concept.id.split("-")[0]}
          </Box>
          <Box
            component="span"
            sx={{
              padding: "3px 9px",
              borderRadius: "7px",
              fontFamily: auroraPalette.font.mono,
              fontSize: "11px",
              fontWeight: 600,
              background: auroraTint(auroraPalette.teal, 0.13),
              border: `1px solid ${auroraTint(auroraPalette.teal, 0.3)}`,
              color: auroraPalette.teal,
              whiteSpace: "nowrap",
            }}
          >
            Step {step.order}
          </Box>
          {isExternal && (
            <Pill tone="concept" icon={<FileText size={12} />}>
              External Source
            </Pill>
          )}
          {isSubConcept && (
            <Pill tone="enrich" icon={<GitBranch size={12} />}>
              Sub-concept
            </Pill>
          )}
          {difficulty && difficultyColor && (
            <Box
              component="span"
              sx={{
                padding: "3px 11px",
                borderRadius: auroraPalette.radii.pill,
                fontSize: "11.5px",
                fontWeight: 600,
                whiteSpace: "nowrap",
                background: auroraTint(difficultyColor, 0.14),
                border: `1px solid ${auroraTint(difficultyColor, 0.3)}`,
                color: difficultyColor,
              }}
            >
              {difficulty}
            </Box>
          )}
        </Box>

        <Box
          sx={{
            flex: "none",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          {isLoading ? (
            <CircularProgress size={20} sx={{ color: palette.primary.light }} />
          ) : (
            <>
              {isOwner && nextAction && (
                <Tooltip title={nextAction.label}>
                  <Box
                    component="span"
                    onClick={(e) => {
                      e.stopPropagation();
                      onStatusChange(nextAction.status);
                    }}
                    sx={iconButtonSx}
                  >
                    <nextAction.icon size={18} />
                  </Box>
                </Tooltip>
              )}
              {isOwner && canSkip && (
                <Tooltip title="Skip">
                  <Box
                    component="span"
                    onClick={(e) => {
                      e.stopPropagation();
                      onStatusChange(StepStatus.SKIPPED);
                    }}
                    sx={iconButtonSx}
                  >
                    <SkipForward size={17} />
                  </Box>
                </Tooltip>
              )}
            </>
          )}
          <MotionBox
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.25 }}
            sx={{ ...iconButtonSx, cursor: "pointer" }}
          >
            <ChevronDown size={18} />
          </MotionBox>
        </Box>
      </Box>

      {step.concept.description && (
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            gap: "9px",
            fontSize: "14.5px",
            lineHeight: 1.55,
            color: auroraPalette.txMid,
            "&::before": {
              content: '""',
              flex: "none",
              width: "3px",
              alignSelf: "stretch",
              borderRadius: "2px",
              background: auroraTint(auroraPalette.teal, 0.55),
            },
          }}
        >
          <Box component="p" sx={{ margin: 0 }}>
            {step.concept.description}
          </Box>
        </Box>
      )}

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "14px",
          flexWrap: "wrap",
        }}
      >
        {status === StepStatus.NOT_STARTED && (
          <Box
            component="span"
            sx={{
              padding: "4px 11px",
              borderRadius: auroraPalette.radii.pill,
              fontSize: "12px",
              fontWeight: 700,
              background: auroraTint(auroraPalette.status.ready, 0.14),
              border: `1px solid ${auroraTint(auroraPalette.status.ready, 0.32)}`,
              color: auroraPalette.status.ready,
            }}
          >
            New
          </Box>
        )}
        {status === StepStatus.IN_PROGRESS && (
          <Pill tone="proc">In Progress</Pill>
        )}
        {status === StepStatus.COMPLETED && <Pill tone="ready">Completed</Pill>}
        {status === StepStatus.SKIPPED && (
          <Box
            component="span"
            sx={{
              padding: "4px 11px",
              borderRadius: auroraPalette.radii.pill,
              fontSize: "12px",
              fontWeight: 600,
              background: auroraTint(auroraPalette.txMid, 0.12),
              border: `1px solid ${auroraTint(auroraPalette.txMid, 0.25)}`,
              color: auroraPalette.txMid,
            }}
          >
            Skipped
          </Box>
        )}
        {step.estimatedDuration && (
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: "7px",
              fontFamily: auroraPalette.font.mono,
              fontSize: "12.5px",
              color: auroraPalette.txMid,
            }}
          >
            <Clock size={14} />
            {formatDuration(step.estimatedDuration)}
          </Box>
        )}
        {quizReady && status === StepStatus.IN_PROGRESS && (
          <Pill tone="teal">Quiz Ready</Pill>
        )}
      </Box>
    </Box>
  );
}

const iconButtonSx = {
  width: 34,
  height: 34,
  borderRadius: "9px",
  display: "grid",
  placeItems: "center",
  cursor: "pointer",
  background: "transparent",
  border: "1px solid transparent",
  color: auroraPalette.txLow,
  transition: "all .15s",
  "&:hover": {
    background: auroraPalette.surface2,
    color: auroraPalette.txHi,
    borderColor: auroraPalette.line,
  },
} as const;
