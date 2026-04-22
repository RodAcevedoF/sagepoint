"use client";

import {
  useGenerateStepQuizMutation,
  useSubmitStepQuizMutation,
} from "@/infrastructure/api/roadmapApi";
import type { StepQuizQuestionDto } from "@/infrastructure/api/roadmapApi";
import { catcher } from "@/application/common";

export interface PreGeneratedQuiz {
  attemptId: string;
  questions: StepQuizQuestionDto[];
}

export function useStepQuizCommand() {
  const [generateMutation, { isLoading: isGenerating }] =
    useGenerateStepQuizMutation();
  const [submitMutation, { isLoading: isSubmitting }] =
    useSubmitStepQuizMutation();

  const generate = (roadmapId: string, conceptId: string) =>
    catcher(() => generateMutation({ roadmapId, conceptId }).unwrap());

  const submit = (
    roadmapId: string,
    attemptId: string,
    answers: Record<number, string>,
  ) =>
    catcher(() => submitMutation({ roadmapId, attemptId, answers }).unwrap());

  return { generate, submit, isGenerating, isSubmitting };
}
