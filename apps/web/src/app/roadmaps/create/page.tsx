'use client';

import { Box, Container } from '@mui/material';
import { AuthGuard } from '@/features/auth/components';
import { DashboardAppBar } from '@/common/components';
import { GenerationView } from '@/features/roadmap';

export default function CreateRoadmapPage() {
  return (
    <AuthGuard>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
          pb: 12,
        }}
      >
        <Container maxWidth="sm">
          <GenerationView />
        </Container>
      </Box>
      <DashboardAppBar />
    </AuthGuard>
  );
}
