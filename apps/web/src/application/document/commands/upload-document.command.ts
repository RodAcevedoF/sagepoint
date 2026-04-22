"use client";

import { useUploadDocumentMutation } from "@/infrastructure/api/documentApi";
import { useCommand } from "@/application/common";

export function useUploadDocumentCommand() {
  const cmd = useCommand(useUploadDocumentMutation, {
    mapError: (e) => (e.status === 402 ? { ...e, tag: "DOCUMENT_LIMIT" } : e),
  });

  return {
    ...cmd,
    execute: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return cmd.execute(formData);
    },
  };
}
