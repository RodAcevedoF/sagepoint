'use client';

import { useGetUserDocumentsQuery } from '@/infrastructure/api/documentApi';

export function useUserDocumentsQuery(params?: { limit?: number; cursor?: string }) {
  return useGetUserDocumentsQuery(params ?? undefined);
}
