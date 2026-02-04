'use client';

import { Dashboard } from '@/features/dashboard/components/Dashboard';
import { AuthGuard } from '@/features/auth/components';

export default function Page() {
  return (
    <AuthGuard>
      <Dashboard />
    </AuthGuard>
  );
}
