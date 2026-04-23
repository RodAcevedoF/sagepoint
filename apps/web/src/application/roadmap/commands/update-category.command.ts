"use client";

import { useUpdateRoadmapCategoryMutation } from "@/infrastructure/api/roadmapApi";
import { useCommand } from "@/application/common";

export function useUpdateRoadmapCategoryCommand() {
  const cmd = useCommand(useUpdateRoadmapCategoryMutation);
  return {
    ...cmd,
    execute: (roadmapId: string, categoryId: string | null) =>
      cmd.execute({ roadmapId, categoryId }),
  };
}
