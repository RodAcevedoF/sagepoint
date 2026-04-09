"use client";

import { useUploadDocumentMutation } from "@/infrastructure/api/documentApi";

export class DocumentLimitError extends Error {}

export function useUploadDocumentCommand() {
  const [uploadMutation, { isLoading }] = useUploadDocumentMutation();

  const execute = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      return await uploadMutation(formData).unwrap();
    } catch (err: unknown) {
      if ((err as { status?: number })?.status === 402)
        throw new DocumentLimitError();
      throw err;
    }
  };

  return { execute, isLoading };
}
