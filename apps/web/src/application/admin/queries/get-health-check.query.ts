'use client';

import { useGetHealthCheckQuery } from '@/infrastructure/api/adminApi';

export function useHealthCheckQuery() {
  return useGetHealthCheckQuery(undefined, { pollingInterval: 30_000 });
}
