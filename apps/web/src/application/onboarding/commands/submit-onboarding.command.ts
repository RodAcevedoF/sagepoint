"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSubmitOnboardingMutation } from "@/infrastructure/api/onboardingApi";
import { useGenerateTopicRoadmapMutation } from "@/infrastructure/api/roadmapApi";
import type { OnboardingData } from "@/features/onboarding/context/OnboardingContext";
import { catcher } from "@/application/common";

export function useSubmitOnboardingCommand() {
  const [submitMutation, { error }] = useSubmitOnboardingMutation();
  const [isLoading, setIsLoading] = useState(false);
  const [generateRoadmap] = useGenerateTopicRoadmapMutation();
  const router = useRouter();

  const execute = async (data: OnboardingData) => {
    setIsLoading(true);
    const submit = await catcher(() =>
      submitMutation({
        goal: data.goal,
        experience: data.experience,
        interests: data.interests,
        weeklyHours: data.weeklyHours,
        status: "COMPLETED",
      }).unwrap(),
    );
    if (!submit.ok) {
      setIsLoading(false);
      return submit;
    }

    if (!data.goal) {
      router.replace("/dashboard?creating=roadmap");
      return submit;
    }

    const generate = await catcher(() =>
      generateRoadmap({
        topic: data.goal,
        ...(data.experience && {
          userContext: {
            experienceLevel: data.experience as
              | "beginner"
              | "intermediate"
              | "advanced"
              | "expert",
          },
        }),
      }).unwrap(),
    );
    if (!generate.ok) {
      setIsLoading(false);
      return generate;
    }
    router.replace(`/dashboard?creating=roadmap&roadmapId=${generate.data.id}`);
    return generate;
  };

  return { execute, isLoading, error };
}
