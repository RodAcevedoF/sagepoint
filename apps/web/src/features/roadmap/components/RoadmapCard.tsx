'use client';

import { Box, Typography, LinearProgress, Chip, alpha } from '@mui/material';
import { Clock, BookOpen, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Card } from '@/common/components';
import { palette } from '@/common/theme';
import type { UserRoadmapDto } from '@/infrastructure/api/roadmapApi';

interface RoadmapCardProps {
  data: UserRoadmapDto;
}

function formatDuration(minutes?: number): string {
  if (!minutes) return 'Flexible';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function RoadmapCard({ data }: RoadmapCardProps) {
  const router = useRouter();
  const { roadmap, progress } = data;

  const handleClick = () => {
    router.push(`/roadmaps/${roadmap.id}`);
  };

  return (
    <Card onClick={handleClick} variant="glass">
      <Card.Content>
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: palette.text.primary,
              mb: 0.5,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {roadmap.title}
          </Typography>
          {roadmap.description && (
            <Typography
              variant="body2"
              sx={{
                color: palette.text.secondary,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {roadmap.description}
            </Typography>
          )}
        </Box>

        {/* Progress Bar */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" sx={{ color: palette.text.secondary }}>
              Progress
            </Typography>
            <Typography variant="caption" sx={{ color: palette.primary.light, fontWeight: 600 }}>
              {progress.progressPercentage}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progress.progressPercentage}
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: alpha(palette.primary.main, 0.1),
              '& .MuiLinearProgress-bar': {
                borderRadius: 3,
                bgcolor: palette.primary.main,
              },
            }}
          />
        </Box>

        {/* Stats Row */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <BookOpen size={14} color={palette.text.secondary} />
            <Typography variant="caption" sx={{ color: palette.text.secondary }}>
              {progress.completedSteps}/{progress.totalSteps} steps
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Clock size={14} color={palette.text.secondary} />
            <Typography variant="caption" sx={{ color: palette.text.secondary }}>
              {formatDuration(roadmap.totalEstimatedDuration)}
            </Typography>
          </Box>
        </Box>
      </Card.Content>

      <Card.Footer>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {progress.inProgressSteps > 0 && (
            <Chip
              size="small"
              icon={<TrendingUp size={12} />}
              label={`${progress.inProgressSteps} in progress`}
              sx={{
                bgcolor: alpha(palette.warning.main, 0.1),
                color: palette.warning.light,
                '& .MuiChip-icon': { color: palette.warning.light },
              }}
            />
          )}
          {roadmap.recommendedPace && (
            <Chip
              size="small"
              label={roadmap.recommendedPace}
              sx={{
                bgcolor: alpha(palette.info.main, 0.1),
                color: palette.info.light,
              }}
            />
          )}
        </Box>
      </Card.Footer>
    </Card>
  );
}
