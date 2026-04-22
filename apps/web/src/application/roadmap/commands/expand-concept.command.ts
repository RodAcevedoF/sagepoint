"use client";

import { useExpandConceptMutation } from "@/infrastructure/api/roadmapApi";
import { useCommand } from "@/application/common";

export function useExpandConceptCommand() {
  const cmd = useCommand(useExpandConceptMutation);
  return {
    ...cmd,
    execute: (roadmapId: string, conceptId: string) =>
      cmd.execute({ roadmapId, conceptId }),
  };
}
