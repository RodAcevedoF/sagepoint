"use client";

import { useGetUserActivityQuery } from "@/infrastructure/api/roadmapApi";

export function useUserActivityQuery(days = 90) {
  return useGetUserActivityQuery({ days });
}
