'use client';

import { useGetDocumentQuizzesQuery } from '@/infrastructure/api/documentApi';

export function useDocumentQuizzesQuery(documentId: string) {
  return useGetDocumentQuizzesQuery(documentId);
}
