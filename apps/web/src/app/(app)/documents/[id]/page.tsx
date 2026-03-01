'use client';

import { use } from 'react';
import { Box, Container } from '@mui/material';
import { DocumentDetail } from '@/features/document';

export default function DocumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth='lg'>
        <DocumentDetail documentId={id} />
      </Container>
    </Box>
  );
}
