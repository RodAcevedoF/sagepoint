'use client';

import { useGetAdminStatsQuery } from '@/infrastructure/api/adminApi';

export function useAdminStatsQuery() {
  return useGetAdminStatsQuery();
}
