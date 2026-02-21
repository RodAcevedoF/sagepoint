'use client';

import { useGetQuizWithQuestionsQuery } from '@/infrastructure/api/documentApi';

export function useQuizQuestionsQuery(documentId: string, quizId: string) {
  return useGetQuizWithQuestionsQuery({ documentId, quizId });
}
