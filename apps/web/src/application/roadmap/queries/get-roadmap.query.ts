"use client";

import {
  roadmapApi,
  useGetRoadmapByIdQuery,
  useGetRoadmapWithProgressQuery,
} from "@/infrastructure/api/roadmapApi";

export function useRoadmapQuery(id: string) {
  return useGetRoadmapByIdQuery(id);
}

export function useRoadmapWithProgressQuery(
  id: string,
  options?: { pollingInterval?: number },
) {
  return useGetRoadmapWithProgressQuery(id, options);
}

export function useRoadmapWithProgressQueryState(id: string) {
  return roadmapApi.endpoints.getRoadmapWithProgress.useQueryState(id);
}
