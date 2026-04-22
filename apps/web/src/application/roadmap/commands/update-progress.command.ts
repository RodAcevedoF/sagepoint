"use client";

import type { StepStatus } from "@sagepoint/domain";
import { useUpdateStepProgressMutation } from "@/infrastructure/api/roadmapApi";
import { useCommand } from "@/application/common";

export function useUpdateProgressCommand() {
  const cmd = useCommand(useUpdateStepProgressMutation);
  return {
    ...cmd,
    execute: (roadmapId: string, conceptId: string, status: StepStatus) =>
      cmd.execute({ roadmapId, conceptId, status }),
  };
}
