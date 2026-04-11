"use client";

import { useRouter } from "next/navigation";
import { useSubmitOnboardingMutation } from "@/infrastructure/api/onboardingApi";

export function useSkipOnboardingCommand() {
  const [submitMutation, { isLoading, error }] = useSubmitOnboardingMutation();
  const router = useRouter();

  const execute = async () => {
    await submitMutation({
      goal: "",
      experience: "",
      interests: [],
      weeklyHours: "",
      status: "SKIPPED",
    }).unwrap();

    router.replace("/dashboard");
  };

  return { execute, isLoading, error };
}
