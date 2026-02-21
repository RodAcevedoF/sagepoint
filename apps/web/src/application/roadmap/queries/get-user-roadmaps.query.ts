'use client';

import { useGetUserRoadmapsQuery } from '@/infrastructure/api/roadmapApi';

export function useUserRoadmapsQuery(options?: { pollingInterval?: number }) {
  return useGetUserRoadmapsQuery(undefined, options);
}
