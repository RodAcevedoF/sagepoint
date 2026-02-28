'use client';

import { useGetQueueStatsQuery } from '@/infrastructure/api/adminApi';

export function useQueueStatsQuery() {
  return useGetQueueStatsQuery(undefined, { pollingInterval: 15_000 });
}
