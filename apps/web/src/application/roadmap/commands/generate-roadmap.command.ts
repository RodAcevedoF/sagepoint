"use client";

import { useRouter } from "next/navigation";
import { useGenerateRoadmapMutation } from "@/infrastructure/api/roadmapApi";
import type { GenerateTopicRoadmapDto } from "@/infrastructure/api/roadmapApi";
import { catcher } from "@/application/common";

interface GenerateOptions {
  title?: string;
  userContext?: GenerateTopicRoadmapDto["userContext"];
  navigateOnSuccess?: boolean;
}

export function useGenerateRoadmapCommand() {
  const [generateMutation, { isLoading }] = useGenerateRoadmapMutation();
  const router = useRouter();

  const execute = async (documentId: string, options?: GenerateOptions) => {
    const result = await catcher(() =>
      generateMutation({
        documentId,
        title: options?.title,
        userContext: options?.userContext,
      }).unwrap(),
    );
    if (result.ok && options?.navigateOnSuccess) {
      router.push(`/roadmaps/${result.data.id}`);
    }
    return result;
  };

  return { execute, isLoading };
}
