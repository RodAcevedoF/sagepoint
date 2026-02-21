'use client';

import { useDeleteDocumentMutation } from '@/infrastructure/api/documentApi';

export function useDeleteDocumentCommand() {
  const [deleteMutation, { isLoading, error }] = useDeleteDocumentMutation();

  const execute = async (documentId: string) => {
    return await deleteMutation(documentId).unwrap();
  };

  return { execute, isLoading, error };
}
