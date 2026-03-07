'use client';

import { useUpdateVisibilityMutation } from '@/infrastructure/api/roadmapApi';
import { type RoadmapVisibility } from '@sagepoint/domain';

export function useUpdateVisibilityCommand() {
  const [updateMutation, { isLoading, error }] = useUpdateVisibilityMutation();

  const execute = async (roadmapId: string, visibility: RoadmapVisibility) => {
    return await updateMutation({ roadmapId, visibility }).unwrap();
  };

  return { execute, isLoading, error };
}
