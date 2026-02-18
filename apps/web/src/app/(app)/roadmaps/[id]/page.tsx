'use client';

import { use } from 'react';
import { Box, Container } from '@mui/material';
import { RoadmapDetail } from '@/features/roadmap';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function RoadmapDetailPage({ params }: PageProps) {
  const { id } = use(params);

  return (
    <Box sx={{ minHeight: '100vh', py: 4, pb: 12 }}>
      <Container maxWidth='lg'>
        <RoadmapDetail roadmapId={id} />
      </Container>
    </Box>
  );
}
