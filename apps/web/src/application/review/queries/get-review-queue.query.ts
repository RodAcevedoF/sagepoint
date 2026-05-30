"use client";

import {
  useGetReviewQueueQuery,
  type GetReviewQueueArgs,
} from "@/infrastructure/api/reviewApi";

export function useReviewQueueQuery(args?: GetReviewQueueArgs) {
  return useGetReviewQueueQuery(args ?? undefined);
}
