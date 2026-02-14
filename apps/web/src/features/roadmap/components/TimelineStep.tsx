'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Chip,
  alpha,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  PlayCircle,
  CheckCircle2,
  SkipForward,
  ChevronDown,
  Clock,
  Target,
  Lightbulb,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { StepStatus, type RoadmapStep } from '@sagepoint/domain';
import { useUpdateProgressCommand } from '@/application/roadmap';
import type { ResourceDto } from '@/infrastructure/api/roadmapApi';
import { palette } from '@/common/theme';
import { StepResources } from './StepResources';

const MotionBox = motion.create(Box);

interface TimelineStepProps {
  step: RoadmapStep;
  roadmapId: string;
  status: StepStatus;
  resources: ResourceDto[];
  resourcesLoading?: boolean;
  isLast?: boolean;
  index: number;
}

const STATUS_DOT_COLORS: Record<StepStatus, string> = {
  [StepStatus.NOT_STARTED]: palette.text.secondary,
  [StepStatus.IN_PROGRESS]: palette.warning.light,
  [StepStatus.COMPLETED]: palette.success.light,
  [StepStatus.SKIPPED]: alpha(palette.text.secondary, 0.5),
};

const STATUS_LABELS: Record<StepStatus, { label: string; color: string }> = {
  [StepStatus.COMPLETED]: { label: 'Completed', color: palette.success.light },
  [StepStatus.IN_PROGRESS]: { label: 'In Progress', color: palette.warning.light },
  [StepStatus.NOT_STARTED]: { label: 'New', color: palette.primary.light },
  [StepStatus.SKIPPED]: { label: 'Skipped', color: palette.text.secondary },
};

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: palette.success.light,
  intermediate: palette.warning.light,
  advanced: palette.error.light,
};

function formatDuration(minutes?: number): string {
  if (!minutes) return '';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

function getNextAction(status: StepStatus) {
  switch (status) {
    case StepStatus.NOT_STARTED:
      return { status: StepStatus.IN_PROGRESS, label: 'Start', icon: PlayCircle };
    case StepStatus.IN_PROGRESS:
      return { status: StepStatus.COMPLETED, label: 'Complete', icon: CheckCircle2 };
    case StepStatus.SKIPPED:
      return { status: StepStatus.IN_PROGRESS, label: 'Start', icon: PlayCircle };
    default:
      return null;
  }
}

export function TimelineStep({
  step,
  roadmapId,
  status,
  resources,
  resourcesLoading,
  isLast = false,
  index,
}: TimelineStepProps) {
  const [expanded, setExpanded] = useState(false);
  const { execute: updateProgress, isLoading } = useUpdateProgressCommand();

  const dotColor = STATUS_DOT_COLORS[status];
  const statusInfo = STATUS_LABELS[status];
  const nextAction = getNextAction(status);
  const isActive = status === StepStatus.IN_PROGRESS;
  const isCompleted = status === StepStatus.COMPLETED;
  const canSkip = status !== StepStatus.SKIPPED && status !== StepStatus.COMPLETED;

  const handleStatusChange = async (newStatus: StepStatus) => {
    try {
      await updateProgress(roadmapId, step.concept.id, newStatus);
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  };

  return (
    <MotionBox
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.1 + index * 0.06 }}
      sx={{ display: 'flex', gap: 2.5 }}
    >
      {/* Left column: dot + connector */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 2.5 }}>
        {/* Status dot */}
        <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {isActive && (
            <MotionBox
              animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              sx={{
                position: 'absolute',
                width: 40,
                height: 40,
                borderRadius: '50%',
                bgcolor: alpha(dotColor, 0.3),
              }}
            />
          )}
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: isCompleted ? dotColor : alpha(dotColor, 0.15),
              color: isCompleted ? palette.background.default : dotColor,
              transition: 'all 0.3s ease',
              zIndex: 1,
            }}
          >
            {isCompleted ? (
              <CheckCircle2 size={20} />
            ) : (
              <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.7rem' }}>
                {step.order}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Connector line */}
        {!isLast && (
          <Box
            sx={{
              flex: 1,
              width: 2,
              mt: 1,
              bgcolor: isCompleted ? alpha(palette.success.light, 0.3) : alpha(palette.divider, 1),
              transition: 'background-color 0.3s ease',
            }}
          />
        )}
      </Box>

      {/* Right column: expandable card */}
      <Box sx={{ flex: 1, pb: isLast ? 0 : 3 }}>
        <Box
          sx={{
            borderRadius: 4,
            overflow: 'hidden',
            background: alpha(palette.background.paper, 0.4),
            backdropFilter: 'blur(12px)',
            border: `1px solid ${alpha(palette.primary.light, 0.1)}`,
            transition: 'all 0.3s ease',
            '&:hover': {
              borderColor: alpha(palette.primary.light, 0.25),
            },
          }}
        >
          {/* Collapsed header */}
          <Box
            onClick={() => setExpanded((prev) => !prev)}
            sx={{
              p: 2.5,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            <Box sx={{ flex: 1, minWidth: 0 }}>
              {/* Title row */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: palette.text.primary }}>
                  {step.concept.name}
                </Typography>
                <Chip
                  size="small"
                  label={`Step ${step.order}`}
                  sx={{
                    height: 22,
                    fontSize: '0.65rem',
                    bgcolor: alpha(palette.primary.main, 0.1),
                    color: palette.primary.light,
                  }}
                />
                {step.difficulty && (
                  <Chip
                    size="small"
                    label={step.difficulty}
                    sx={{
                      height: 22,
                      fontSize: '0.65rem',
                      bgcolor: alpha(DIFFICULTY_COLORS[step.difficulty] || palette.text.secondary, 0.1),
                      color: DIFFICULTY_COLORS[step.difficulty] || palette.text.secondary,
                    }}
                  />
                )}
              </Box>

              {/* Description */}
              {step.concept.description && (
                <Typography
                  variant="body2"
                  sx={{
                    color: palette.text.secondary,
                    mb: 1,
                    display: '-webkit-box',
                    WebkitLineClamp: expanded ? 999 : 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {step.concept.description}
                </Typography>
              )}

              {/* Meta row */}
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
                <Chip
                  size="small"
                  label={statusInfo.label}
                  sx={{
                    height: 22,
                    fontSize: '0.65rem',
                    fontWeight: 600,
                    bgcolor: alpha(statusInfo.color, 0.12),
                    color: statusInfo.color,
                  }}
                />
                {step.estimatedDuration && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Clock size={12} color={palette.text.secondary} />
                    <Typography variant="caption" sx={{ color: palette.text.secondary }}>
                      {formatDuration(step.estimatedDuration)}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>

            {/* Actions + chevron */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
              {isLoading ? (
                <CircularProgress size={20} />
              ) : (
                <>
                  {nextAction && (
                    <Tooltip title={nextAction.label}>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChange(nextAction.status);
                        }}
                        sx={{
                          color: palette.primary.light,
                          '&:hover': { bgcolor: alpha(palette.primary.main, 0.1) },
                        }}
                      >
                        <nextAction.icon size={18} />
                      </IconButton>
                    </Tooltip>
                  )}
                  {canSkip && (
                    <Tooltip title="Skip">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChange(StepStatus.SKIPPED);
                        }}
                        sx={{
                          color: palette.text.secondary,
                          '&:hover': { bgcolor: alpha(palette.text.secondary, 0.1) },
                        }}
                      >
                        <SkipForward size={16} />
                      </IconButton>
                    </Tooltip>
                  )}
                </>
              )}
              <MotionBox
                animate={{ rotate: expanded ? 180 : 0 }}
                transition={{ duration: 0.25 }}
                sx={{ display: 'flex', color: palette.text.secondary }}
              >
                <ChevronDown size={18} />
              </MotionBox>
            </Box>
          </Box>

          {/* Expanded content */}
          <AnimatePresence>
            {expanded && (
              <MotionBox
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                sx={{ overflow: 'hidden' }}
              >
                <Box sx={{ px: 2.5, pb: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* Learning Objective */}
                  {step.learningObjective && (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 1.5,
                        p: 2,
                        borderRadius: 3,
                        bgcolor: alpha(palette.info.main, 0.06),
                        border: `1px solid ${alpha(palette.info.main, 0.12)}`,
                      }}
                    >
                      <Target size={16} color={palette.info.light} style={{ marginTop: 2, flexShrink: 0 }} />
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: 600, color: palette.info.light, display: 'block', mb: 0.5 }}
                        >
                          Learning Objective
                        </Typography>
                        <Typography variant="body2" sx={{ color: palette.text.secondary }}>
                          {step.learningObjective}
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  {/* Rationale */}
                  {step.rationale && (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 1.5,
                        p: 2,
                        borderRadius: 3,
                        bgcolor: alpha(palette.primary.main, 0.06),
                        border: `1px solid ${alpha(palette.primary.main, 0.12)}`,
                      }}
                    >
                      <Lightbulb size={16} color={palette.primary.light} style={{ marginTop: 2, flexShrink: 0 }} />
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: 600, color: palette.primary.light, display: 'block', mb: 0.5 }}
                        >
                          Why this step?
                        </Typography>
                        <Typography variant="body2" sx={{ color: palette.text.secondary }}>
                          {step.rationale}
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  {/* Resources */}
                  <StepResources resources={resources} isLoading={resourcesLoading} />
                </Box>
              </MotionBox>
            )}
          </AnimatePresence>
        </Box>
      </Box>
    </MotionBox>
  );
}
