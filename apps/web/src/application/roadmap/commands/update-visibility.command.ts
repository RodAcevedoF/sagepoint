"use client";

import { useUpdateVisibilityMutation } from "@/infrastructure/api/roadmapApi";
import { type RoadmapVisibility } from "@sagepoint/domain";
import { useCommand } from "@/application/common";

export function useUpdateVisibilityCommand() {
  const cmd = useCommand(useUpdateVisibilityMutation);
  return {
    ...cmd,
    execute: (roadmapId: string, visibility: RoadmapVisibility) =>
      cmd.execute({ roadmapId, visibility }),
  };
}
