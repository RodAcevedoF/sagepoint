"use client";

import { useRouter } from "next/navigation";
import { useSubmitOnboardingMutation } from "@/infrastructure/api/onboardingApi";
import { useCommand } from "@/application/common";

const SKIP_PAYLOAD = {
  goal: "",
  experience: "",
  interests: [],
  weeklyHours: "",
  status: "SKIPPED" as const,
};

export function useSkipOnboardingCommand() {
  const router = useRouter();
  const cmd = useCommand(useSubmitOnboardingMutation, {
    onSuccess: () => router.replace("/dashboard"),
  });
  return {
    ...cmd,
    execute: () => cmd.execute(SKIP_PAYLOAD),
  };
}
