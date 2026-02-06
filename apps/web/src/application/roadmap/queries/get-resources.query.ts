'use client';

import {
  useGetRoadmapResourcesQuery,
  useLazyGetRoadmapResourcesQuery,
} from '@/infrastructure/api/roadmapApi';

export function useResourcesQuery(roadmapId: string) {
  return useGetRoadmapResourcesQuery(roadmapId);
}

export function useLazyResourcesQuery() {
  return useLazyGetRoadmapResourcesQuery();
}
