"use client";

import { useRouter } from "next/navigation";
import {
  useGenerateTopicRoadmapMutation,
  type GenerateTopicRoadmapDto,
} from "@/infrastructure/api/roadmapApi";

interface GenerateOptions {
  navigateOnSuccess?: boolean;
  userContext?: GenerateTopicRoadmapDto["userContext"];
}

export class RoadmapLimitError extends Error {}

export function useGenerateTopicRoadmapCommand() {
  const [generateMutation, { isLoading }] = useGenerateTopicRoadmapMutation();
  const router = useRouter();

  const execute = async (
    topic: string,
    title?: string,
    options?: GenerateOptions,
  ) => {
    const body: GenerateTopicRoadmapDto = {
      topic,
      title: title || undefined,
      userContext: options?.userContext,
    };
    try {
      const roadmap = await generateMutation(body).unwrap();
      if (options?.navigateOnSuccess) {
        router.push(`/roadmaps/${roadmap.id}`);
      }
      return roadmap;
    } catch (err: unknown) {
      if ((err as { status?: number })?.status === 402)
        throw new RoadmapLimitError();
      throw err;
    }
  };

  return { execute, isLoading };
}
