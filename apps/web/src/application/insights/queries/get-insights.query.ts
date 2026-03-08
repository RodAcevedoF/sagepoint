'use client';

import { useGetInsightsQuery } from '@/infrastructure/api/insightsApi';

export function useInsightsQuery() {
  return useGetInsightsQuery();
}
