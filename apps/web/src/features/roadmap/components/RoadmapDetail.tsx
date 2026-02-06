'use client';

import { useMemo } from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Chip,
  CircularProgress,
  alpha,
} from '@mui/material';
import { Clock, BookOpen, Zap, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { StepStatus } from '@sagepoint/domain';
import { useRoadmapWithProgressQuery, useResourcesQuery } from '@/application/roadmap';
import { EmptyState, ErrorState, Button } from '@/common/components';
import { palette } from '@/common/theme';
import { ButtonVariants, ButtonIconPositions } from '@/common/types';
import { RoadmapStep } from './RoadmapStep';

interface RoadmapDetailProps {
  roadmapId: string;
}

function formatDuration(minutes?: number): string {
  if (!minutes) return 'Flexible';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function RoadmapDetail({ roadmapId }: RoadmapDetailProps) {
  const router = useRouter();
  const {
    data: roadmapData,
    isLoading: roadmapLoading,
    error: roadmapError,
  } = useRoadmapWithProgressQuery(roadmapId);
  const {
    data: resources,
    isLoading: resourcesLoading,
  } = useResourcesQuery(roadmapId);

  // Group resources by conceptId
  const resourcesByConceptId = useMemo(() => {
    if (!resources) return {};
    return resources.reduce(
      (acc, resource) => {
        if (!acc[resource.conceptId]) {
          acc[resource.conceptId] = [];
        }
        acc[resource.conceptId].push(resource);
        return acc;
      },
      {} as Record<string, typeof resources>
    );
  }, [resources]);

  if (roadmapLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (roadmapError || !roadmapData) {
    return (
      <ErrorState
        title="Roadmap not found"
        description="The roadmap you're looking for doesn't exist or you don't have access to it."
        onRetry={() => router.push('/roadmaps')}
        retryLabel="Back to Roadmaps"
      />
    );
  }

  const { progress, stepProgress } = roadmapData;
  const orderedSteps = [...roadmapData.steps].sort((a, b) => a.order - b.order);

  return (
    <Box>
      {/* Back Button */}
      <Box sx={{ mb: 3 }}>
        <Button
          label="Back to Roadmaps"
          icon={ArrowLeft}
          iconPos={ButtonIconPositions.START}
          variant={ButtonVariants.GHOST}
          onClick={() => router.push('/roadmaps')}
        />
      </Box>

      {/* Header */}
      <Box
        sx={{
          mb: 4,
          p: 4,
          borderRadius: 4,
          bgcolor: alpha(palette.background.paper, 0.4),
          border: `1px solid ${alpha(palette.primary.main, 0.1)}`,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: palette.text.primary,
            mb: 1,
          }}
        >
          {roadmapData.title}
        </Typography>
        {roadmapData.description && (
          <Typography
            variant="body1"
            sx={{ color: palette.text.secondary, mb: 3 }}
          >
            {roadmapData.description}
          </Typography>
        )}

        {/* Progress */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" sx={{ color: palette.text.secondary }}>
              Overall Progress
            </Typography>
            <Typography variant="body2" sx={{ color: palette.primary.light, fontWeight: 600 }}>
              {progress.progressPercentage}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progress.progressPercentage}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: alpha(palette.primary.main, 0.1),
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                bgcolor: palette.primary.main,
              },
            }}
          />
        </Box>

        {/* Stats */}
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BookOpen size={18} color={palette.text.secondary} />
            <Typography variant="body2" sx={{ color: palette.text.secondary }}>
              <Box component="span" sx={{ color: palette.text.primary, fontWeight: 600 }}>
                {progress.completedSteps}
              </Box>
              /{progress.totalSteps} steps completed
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Clock size={18} color={palette.text.secondary} />
            <Typography variant="body2" sx={{ color: palette.text.secondary }}>
              Est. {formatDuration(roadmapData.totalEstimatedDuration)}
            </Typography>
          </Box>
          {roadmapData.recommendedPace && (
            <Chip
              size="small"
              icon={<Zap size={14} />}
              label={roadmapData.recommendedPace}
              sx={{
                bgcolor: alpha(palette.info.main, 0.1),
                color: palette.info.light,
                '& .MuiChip-icon': { color: palette.info.light },
              }}
            />
          )}
        </Box>
      </Box>

      {/* Steps */}
      {orderedSteps.length === 0 ? (
        <EmptyState
          title="No steps yet"
          description="This roadmap doesn't have any steps defined."
        />
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {orderedSteps.map((step, index) => (
            <RoadmapStep
              key={step.concept.id}
              step={step}
              roadmapId={roadmapId}
              status={stepProgress[step.concept.id] || StepStatus.NOT_STARTED}
              resources={resourcesByConceptId[step.concept.id] || []}
              resourcesLoading={resourcesLoading}
              isLast={index === orderedSteps.length - 1}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}
