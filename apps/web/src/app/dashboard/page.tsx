'use client';

import { Dashboard } from '@/features/dashboard/components/Dashboard';
import { useAppSelector } from '@/common/hooks';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Page() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return <Dashboard />;
}
