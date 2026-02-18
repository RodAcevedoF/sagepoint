'use client';

import { Box, Container } from '@mui/material';
import { RoadmapList } from '@/features/roadmap';

export default function RoadmapsPage() {
  return (
    <Box sx={{ minHeight: '100vh', pt: 2, pb: 12 }}>
      <Container maxWidth='lg'>
        <RoadmapList />
      </Container>
    </Box>
  );
}
