"use client";

import { useRouter } from "next/navigation";
import { useSubmitOnboardingMutation } from "@/infrastructure/api/onboardingApi";
import { useGenerateTopicRoadmapMutation } from "@/infrastructure/api/roadmapApi";
import type { OnboardingData } from "@/features/onboarding/context/OnboardingContext";
import { catcher } from "@/application/common";

export function useSubmitOnboardingCommand() {
  const [submitMutation, { isLoading, error }] = useSubmitOnboardingMutation();
  const [generateRoadmap] = useGenerateTopicRoadmapMutation();
  const router = useRouter();

  const execute = async (data: OnboardingData) => {
    const submit = await catcher(() =>
      submitMutation({
        goal: data.goal,
        experience: data.experience,
        interests: data.interests,
        weeklyHours: data.weeklyHours,
        status: "COMPLETED",
      }).unwrap(),
    );
    if (!submit.ok) return submit;

    if (data.goal) {
      const generate = await catcher(() =>
        generateRoadmap({
          topic: data.goal,
          userContext: data.experience
            ? {
                experienceLevel: data.experience as
                  | "beginner"
                  | "intermediate"
                  | "advanced"
                  | "expert",
              }
            : undefined,
        }).unwrap(),
      );
      if (!generate.ok) return generate;
      router.refresh();
      router.push(`/dashboard?creating=roadmap&roadmapId=${generate.data.id}`);
      return generate;
    }

    router.refresh();
    router.push("/dashboard?creating=roadmap");
    return submit;
  };

  return { execute, isLoading, error };
}
