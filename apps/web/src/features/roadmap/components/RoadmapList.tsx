'use client';

import { Box, Grid, Typography, CircularProgress, alpha } from '@mui/material';
import { Map, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUserRoadmapsQuery } from '@/application/roadmap';
import { EmptyState, ErrorState } from '@/common/components';
import { palette } from '@/common/theme';
import { RoadmapCard } from './RoadmapCard';

export function RoadmapList() {
  const router = useRouter();
  const { data: roadmaps, isLoading, error } = useUserRoadmapsQuery();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load roadmaps"
        description="Something went wrong while loading your roadmaps."
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (!roadmaps || roadmaps.length === 0) {
    return (
      <EmptyState
        icon={Map}
        title="No roadmaps yet"
        description="Upload a document to generate your first learning roadmap."
        actionLabel="Upload Document"
        actionIcon={Plus}
        onAction={() => router.push('/dashboard')}
      />
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: palette.text.primary,
            mb: 1,
          }}
        >
          My Roadmaps
        </Typography>
        <Typography variant="body1" sx={{ color: palette.text.secondary }}>
          Track your learning progress across all your roadmaps
        </Typography>
      </Box>

      {/* Stats Summary */}
      <Box
        sx={{
          display: 'flex',
          gap: 3,
          mb: 4,
          p: 3,
          borderRadius: 4,
          bgcolor: alpha(palette.primary.main, 0.05),
          border: `1px solid ${alpha(palette.primary.main, 0.1)}`,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ color: palette.primary.light, fontWeight: 700 }}>
            {roadmaps.length}
          </Typography>
          <Typography variant="caption" sx={{ color: palette.text.secondary }}>
            Total Roadmaps
          </Typography>
        </Box>
        <Box>
          <Typography variant="h4" sx={{ color: palette.success.light, fontWeight: 700 }}>
            {roadmaps.filter((r) => r.progress.progressPercentage === 100).length}
          </Typography>
          <Typography variant="caption" sx={{ color: palette.text.secondary }}>
            Completed
          </Typography>
        </Box>
        <Box>
          <Typography variant="h4" sx={{ color: palette.warning.light, fontWeight: 700 }}>
            {roadmaps.filter((r) => r.progress.inProgressSteps > 0).length}
          </Typography>
          <Typography variant="caption" sx={{ color: palette.text.secondary }}>
            In Progress
          </Typography>
        </Box>
      </Box>

      {/* Roadmaps Grid */}
      <Grid container spacing={3}>
        {roadmaps.map((item) => (
          <Grid key={item.roadmap.id} size={{ xs: 12, sm: 6, lg: 4 }}>
            <RoadmapCard data={item} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
