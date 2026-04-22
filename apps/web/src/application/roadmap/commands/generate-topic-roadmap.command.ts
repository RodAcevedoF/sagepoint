"use client";

import { useRouter } from "next/navigation";
import {
  useGenerateTopicRoadmapMutation,
  type GenerateTopicRoadmapDto,
} from "@/infrastructure/api/roadmapApi";
import { catcher } from "@/application/common";

interface GenerateOptions {
  navigateOnSuccess?: boolean;
  userContext?: GenerateTopicRoadmapDto["userContext"];
}

export function useGenerateTopicRoadmapCommand() {
  const [generateMutation, { isLoading }] = useGenerateTopicRoadmapMutation();
  const router = useRouter();

  const execute = async (
    topic: string,
    title?: string,
    options?: GenerateOptions,
  ) => {
    const result = await catcher(
      () =>
        generateMutation({
          topic,
          title: title || undefined,
          userContext: options?.userContext,
        }).unwrap(),
      (e) => (e.status === 402 ? { ...e, tag: "ROADMAP_LIMIT" } : e),
    );
    if (result.ok && options?.navigateOnSuccess) {
      router.push(`/roadmaps/${result.data.id}`);
    }
    return result;
  };

  return { execute, isLoading };
}
