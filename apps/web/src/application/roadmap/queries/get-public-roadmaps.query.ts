'use client';

import { useGetPublicRoadmapsQuery } from '@/infrastructure/api/roadmapApi';

export function usePublicRoadmapsQuery() {
  return useGetPublicRoadmapsQuery();
}
