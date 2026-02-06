'use client';

import { useGetUserRoadmapsQuery } from '@/infrastructure/api/roadmapApi';

export function useUserRoadmapsQuery() {
  return useGetUserRoadmapsQuery();
}
