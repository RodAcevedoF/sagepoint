'use client';

import { useRefreshResourcesMutation } from '@/infrastructure/api/roadmapApi';

export function useRefreshResourcesCommand() {
  const [refreshMutation, { isLoading, error }] = useRefreshResourcesMutation();

  const execute = async (roadmapId: string) => {
    return refreshMutation(roadmapId).unwrap();
  };

  return { execute, isLoading, error };
}
