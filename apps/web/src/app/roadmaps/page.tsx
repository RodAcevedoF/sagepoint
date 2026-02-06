'use client';

import { Box, Container } from '@mui/material';
import { AuthGuard } from '@/features/auth/components';
import { DashboardAppBar } from '@/common/components';
import { RoadmapList } from '@/features/roadmap';

export default function RoadmapsPage() {
  return (
    <AuthGuard>
      <Box sx={{ minHeight: '100vh', py: 4, pb: 12 }}>
        <Container maxWidth="lg">
          <RoadmapList />
        </Container>
      </Box>
      <DashboardAppBar />
    </AuthGuard>
  );
}
