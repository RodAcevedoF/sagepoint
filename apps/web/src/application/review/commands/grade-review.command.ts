"use client";

import {
  useGradeReviewMutation,
  type ReviewScope,
} from "@/infrastructure/api/reviewApi";
import { useCommand } from "@/application/common";

export function useGradeReviewCommand() {
  const cmd = useCommand(useGradeReviewMutation);
  return {
    ...cmd,
    execute: (cardId: string, quality: number, scope?: ReviewScope) =>
      cmd.execute({ cardId, quality, scope }),
  };
}
