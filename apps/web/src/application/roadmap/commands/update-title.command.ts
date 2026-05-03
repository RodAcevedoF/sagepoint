"use client";

import { useUpdateTitleMutation } from "@/infrastructure/api/roadmapApi";
import { useCommand } from "@/application/common";

export function useUpdateTitleCommand() {
  const cmd = useCommand(useUpdateTitleMutation);
  return {
    ...cmd,
    execute: (roadmapId: string, title: string) =>
      cmd.execute({ roadmapId, title }),
  };
}
