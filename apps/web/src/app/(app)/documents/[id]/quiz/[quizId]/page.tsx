'use client';

import { use } from 'react';
import { Box, Container } from '@mui/material';
import { QuizView } from '@/features/document';

export default function QuizPage({ params }: { params: Promise<{ id: string; quizId: string }> }) {
  const { id, quizId } = use(params);

  return (
    <Box sx={{ minHeight: '100vh', pt: 2, pb: 12 }}>
      <Container maxWidth='md'>
        <QuizView documentId={id} quizId={quizId} />
      </Container>
    </Box>
  );
}
