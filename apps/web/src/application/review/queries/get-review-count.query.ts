"use client";

import {
  useGetReviewCountQuery,
  type ReviewScope,
} from "@/infrastructure/api/reviewApi";

export function useReviewCountQuery(scope?: ReviewScope) {
  return useGetReviewCountQuery(scope ?? undefined);
}
