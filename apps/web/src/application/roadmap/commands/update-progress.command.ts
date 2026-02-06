'use client';

import type { StepStatus } from '@sagepoint/domain';
import { useUpdateStepProgressMutation } from '@/infrastructure/api/roadmapApi';

export function useUpdateProgressCommand() {
  const [updateMutation, { isLoading, error }] = useUpdateStepProgressMutation();

  const execute = async (roadmapId: string, conceptId: string, status: StepStatus) => {
    return updateMutation({ roadmapId, conceptId, status }).unwrap();
  };

  return { execute, isLoading, error };
}
