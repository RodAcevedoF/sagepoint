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
  Circle,
  CheckCircle2,
  PlayCircle,
  SkipForward,
  ChevronDown,
  ChevronUp,
  Clock,
  Target,
} from 'lucide-react';
import { StepStatus, type RoadmapStep as RoadmapStepType } from '@sagepoint/domain';
import { useUpdateProgressCommand } from '@/application/roadmap';
import type { ResourceDto } from '@/infrastructure/api/roadmapApi';
import { palette } from '@/common/theme';
import { StepResources } from './StepResources';

interface RoadmapStepProps {
  step: RoadmapStepType;
  roadmapId: string;
  status: StepStatus;
  resources: ResourceDto[];
  resourcesLoading?: boolean;
  isLast?: boolean;
}

const statusConfig = {
  [StepStatus.NOT_STARTED]: {
    icon: Circle,
    color: palette.text.secondary,
    label: 'Not Started',
  },
  [StepStatus.IN_PROGRESS]: {
    icon: PlayCircle,
    color: palette.warning.light,
    label: 'In Progress',
  },
  [StepStatus.COMPLETED]: {
    icon: CheckCircle2,
    color: palette.success.light,
    label: 'Completed',
  },
  [StepStatus.SKIPPED]: {
    icon: SkipForward,
    color: palette.text.secondary,
    label: 'Skipped',
  },
};

const difficultyColors = {
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

export function RoadmapStep({
  step,
  roadmapId,
  status,
  resources,
  resourcesLoading,
  isLast,
}: RoadmapStepProps) {
  const [expanded, setExpanded] = useState(false);
  const { execute: updateProgress, isLoading } = useUpdateProgressCommand();

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  const handleStatusChange = async (newStatus: StepStatus) => {
    try {
      await updateProgress(roadmapId, step.concept.id, newStatus);
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  };

  const getNextAction = () => {
    switch (status) {
      case StepStatus.NOT_STARTED:
        return { status: StepStatus.IN_PROGRESS, label: 'Start', icon: PlayCircle };
      case StepStatus.IN_PROGRESS:
        return { status: StepStatus.COMPLETED, label: 'Complete', icon: CheckCircle2 };
      case StepStatus.COMPLETED:
        return null;
      case StepStatus.SKIPPED:
        return { status: StepStatus.IN_PROGRESS, label: 'Start', icon: PlayCircle };
      default:
        return null;
    }
  };

  const nextAction = getNextAction();

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Connector Line */}
      {!isLast && (
        <Box
          sx={{
            position: 'absolute',
            left: 19,
            top: 40,
            bottom: -20,
            width: 2,
            bgcolor:
              status === StepStatus.COMPLETED
                ? alpha(palette.success.main, 0.3)
                : alpha(palette.divider, 0.5),
          }}
        />
      )}

      <Box
        sx={{
          display: 'flex',
          gap: 2,
          p: 2,
          borderRadius: 3,
          bgcolor: alpha(palette.background.paper, 0.4),
          border: `1px solid ${alpha(palette.divider, 0.3)}`,
          transition: 'all 0.2s ease',
          '&:hover': {
            bgcolor: alpha(palette.background.paper, 0.6),
            borderColor: alpha(palette.primary.main, 0.2),
          },
        }}
      >
        {/* Status Indicator */}
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: alpha(config.color, 0.1),
            color: config.color,
            flexShrink: 0,
            zIndex: 1,
          }}
        >
          <StatusIcon size={20} />
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 600,
                    color: palette.text.primary,
                  }}
                >
                  {step.concept.name}
                </Typography>
                <Chip
                  size="small"
                  label={`Step ${step.order}`}
                  sx={{
                    height: 20,
                    fontSize: '0.65rem',
                    bgcolor: alpha(palette.primary.main, 0.1),
                    color: palette.primary.light,
                  }}
                />
              </Box>
              {step.concept.description && (
                <Typography
                  variant="body2"
                  sx={{ color: palette.text.secondary, mb: 1 }}
                >
                  {step.concept.description}
                </Typography>
              )}
            </Box>

            {/* Actions */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {isLoading ? (
                <CircularProgress size={20} />
              ) : (
                <>
                  {nextAction && (
                    <Tooltip title={nextAction.label}>
                      <IconButton
                        size="small"
                        onClick={() => handleStatusChange(nextAction.status)}
                        sx={{
                          color: palette.primary.light,
                          '&:hover': { bgcolor: alpha(palette.primary.main, 0.1) },
                        }}
                      >
                        <nextAction.icon size={18} />
                      </IconButton>
                    </Tooltip>
                  )}
                  {status !== StepStatus.SKIPPED && status !== StepStatus.COMPLETED && (
                    <Tooltip title="Skip">
                      <IconButton
                        size="small"
                        onClick={() => handleStatusChange(StepStatus.SKIPPED)}
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
            </Box>
          </Box>

          {/* Learning Objective */}
          {step.learningObjective && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1,
                p: 1.5,
                mb: 1.5,
                borderRadius: 2,
                bgcolor: alpha(palette.info.main, 0.05),
                border: `1px solid ${alpha(palette.info.main, 0.1)}`,
              }}
            >
              <Target size={14} color={palette.info.light} style={{ marginTop: 2, flexShrink: 0 }} />
              <Typography variant="caption" sx={{ color: palette.info.light }}>
                {step.learningObjective}
              </Typography>
            </Box>
          )}

          {/* Meta Info */}
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
            {step.estimatedDuration && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Clock size={12} color={palette.text.secondary} />
                <Typography variant="caption" sx={{ color: palette.text.secondary }}>
                  {formatDuration(step.estimatedDuration)}
                </Typography>
              </Box>
            )}
            {step.difficulty && (
              <Chip
                size="small"
                label={step.difficulty}
                sx={{
                  height: 20,
                  fontSize: '0.65rem',
                  bgcolor: alpha(difficultyColors[step.difficulty] || palette.text.secondary, 0.1),
                  color: difficultyColors[step.difficulty] || palette.text.secondary,
                }}
              />
            )}
            {resources.length > 0 && (
              <Chip
                size="small"
                label={`${resources.length} resources`}
                onClick={() => setExpanded(!expanded)}
                onDelete={() => setExpanded(!expanded)}
                deleteIcon={expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                sx={{
                  height: 20,
                  fontSize: '0.65rem',
                  bgcolor: alpha(palette.secondary.main, 0.1),
                  color: palette.secondary.light,
                  cursor: 'pointer',
                  '& .MuiChip-deleteIcon': {
                    color: palette.secondary.light,
                  },
                }}
              />
            )}
          </Box>
        </Box>
      </Box>

      {/* Resources */}
      <StepResources resources={resources} isLoading={resourcesLoading} expanded={expanded} />
    </Box>
  );
}
