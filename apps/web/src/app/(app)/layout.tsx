'use client';

import type { ReactNode } from 'react';
import { AuthGuard } from '@/features/auth/components';
import { DashboardAppBar } from '@/common/components';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      {children}
      <DashboardAppBar />
    </AuthGuard>
  );
}
