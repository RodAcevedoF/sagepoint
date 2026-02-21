'use client';

import { useGetDocumentSummaryQuery } from '@/infrastructure/api/documentApi';

export function useDocumentSummaryQuery(documentId: string) {
  return useGetDocumentSummaryQuery(documentId);
}
