"use client";

import { useUpdateFilenameMutation } from "@/infrastructure/api/documentApi";
import { useCommand } from "@/application/common";

export function useUpdateFilenameCommand() {
  const cmd = useCommand(useUpdateFilenameMutation);
  return {
    ...cmd,
    execute: (documentId: string, filename: string) =>
      cmd.execute({ documentId, filename }),
  };
}
