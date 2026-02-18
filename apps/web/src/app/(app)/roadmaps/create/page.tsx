'use client';

import { Suspense } from 'react';
import { Box, Container } from '@mui/material';
import { useSearchParams } from 'next/navigation';
import { GenerationView } from '@/features/roadmap';

function CreateRoadmapContent() {
  const searchParams = useSearchParams();
  const initialTopic = searchParams.get('topic') || undefined;
  const initialExperience = searchParams.get('experience') || undefined;
  const fromOnboarding = searchParams.get('from') === 'onboarding';

  return (
    <GenerationView
      initialTopic={initialTopic}
      initialExperience={initialExperience}
      fromOnboarding={fromOnboarding}
    />
  );
}

export default function CreateRoadmapPage() {
  return (
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
        <Suspense>
          <CreateRoadmapContent />
        </Suspense>
      </Container>
    </Box>
  );
}
