'use client';

import {
  useGetRoadmapByIdQuery,
  useGetRoadmapWithProgressQuery,
} from '@/infrastructure/api/roadmapApi';

export function useRoadmapQuery(id: string) {
  return useGetRoadmapByIdQuery(id);
}

export function useRoadmapWithProgressQuery(id: string) {
  return useGetRoadmapWithProgressQuery(id);
}
