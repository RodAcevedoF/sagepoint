"use client";

import { useDeleteRoadmapMutation } from "@/infrastructure/api/roadmapApi";

export function useDeleteRoadmapCommand() {
  const [deleteMutation, { isLoading, error }] = useDeleteRoadmapMutation();

  const execute = async (roadmapId: string) => {
    return await deleteMutation(roadmapId).unwrap();
  };

  return { execute, isLoading, error };
}
