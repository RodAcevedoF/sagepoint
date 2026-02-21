'use client';

import { useGetUserDocumentsQuery } from '@/infrastructure/api/documentApi';

export function useUserDocumentsQuery() {
  return useGetUserDocumentsQuery();
}
