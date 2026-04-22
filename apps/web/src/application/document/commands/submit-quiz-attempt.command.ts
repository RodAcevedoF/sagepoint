"use client";

import { useSubmitQuizAttemptMutation } from "@/infrastructure/api/documentApi";
import { useCommand } from "@/application/common";

export function useSubmitQuizAttemptCommand() {
  const cmd = useCommand(useSubmitQuizAttemptMutation);
  return {
    ...cmd,
    execute: (
      documentId: string,
      quizId: string,
      answers: Record<string, string>,
    ) => cmd.execute({ documentId, quizId, answers }),
  };
}
