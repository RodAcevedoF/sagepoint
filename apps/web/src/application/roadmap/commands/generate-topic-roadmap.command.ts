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

function extractCode(cause: unknown): string | undefined {
  if (typeof cause !== "object" || cause === null) return undefined;
  const data = (cause as { data?: unknown }).data;
  if (typeof data !== "object" || data === null) return undefined;
  const code = (data as { code?: unknown }).code;
  return typeof code === "string" ? code : undefined;
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
      (e) => {
        if (e.status === 402) return { ...e, tag: "ROADMAP_LIMIT" };
        if (e.status === 400 && extractCode(e.cause) === "UNSAFE_USER_TEXT") {
          return {
            ...e,
            tag: "UNSAFE_USER_TEXT",
            message: "That input looks unsafe — please rephrase and try again.",
          };
        }
        return e;
      },
    );
    if (result.ok && options?.navigateOnSuccess) {
      router.push(`/roadmaps/${result.data.id}`);
    }
    return result;
  };

  return { execute, isLoading };
}
