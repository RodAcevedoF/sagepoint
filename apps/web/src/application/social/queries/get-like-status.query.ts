"use client";

import { useGetLikeStatusQuery } from "@/infrastructure/api/socialApi";

export function useLikeStatusQuery(roadmapId: string | null) {
  return useGetLikeStatusQuery(roadmapId!, { skip: !roadmapId });
}
