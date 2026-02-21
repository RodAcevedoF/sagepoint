'use client';

import { useSubmitQuizAttemptMutation } from '@/infrastructure/api/documentApi';

export function useSubmitQuizAttemptCommand() {
  const [submitMutation, { isLoading, error }] = useSubmitQuizAttemptMutation();

  const execute = async (
    documentId: string,
    quizId: string,
    answers: Record<string, string>,
  ) => {
    return await submitMutation({ documentId, quizId, answers }).unwrap();
  };

  return { execute, isLoading, error };
}
