'use client';

import { Container } from '@mui/material';
import { AdminDashboard } from '@/features/admin';

export default function AdminPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <AdminDashboard />
    </Container>
  );
}
