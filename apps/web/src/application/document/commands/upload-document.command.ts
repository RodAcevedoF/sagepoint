'use client';

import { useUploadDocumentMutation } from '@/infrastructure/api/documentApi';

export function useUploadDocumentCommand() {
  const [uploadMutation, { isLoading, error }] = useUploadDocumentMutation();

  const execute = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return await uploadMutation(formData).unwrap();
  };

  return { execute, isLoading, error };
}
