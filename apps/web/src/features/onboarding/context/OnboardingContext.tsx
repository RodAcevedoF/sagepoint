"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useTransition,
  type ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { skipOnboardingAction } from "@/app/actions/onboarding";

// ============================================================================
// Types
// ============================================================================

export interface OnboardingData {
  goal: string;
  experience: string;
  interests: string[];
  weeklyHours: string;
}

interface OnboardingContextValue {
  data: OnboardingData;
  visitedSteps: Set<string>;
  updateData: <K extends keyof OnboardingData>(
    key: K,
    value: OnboardingData[K]
  ) => void;
  canAccessStep: (step: string) => boolean;
  goToStep: (step: string) => void;
  goNext: () => void;
  goBack: () => void;
  skip: () => void;
  isSkipping: boolean;
  currentStepIndex: number;
  totalSteps: number;
  isFirstStep: boolean;
  isLastStep: boolean;
}

// ============================================================================
// Constants
// ============================================================================

export const ONBOARDING_STEPS = [
  "welcome",
  "goal",
  "experience",
  "interests",
  "schedule",
  "complete",
] as const;

export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];

const INITIAL_DATA: OnboardingData = {
  goal: "",
  experience: "",
  interests: [],
  weeklyHours: "",
};

// ============================================================================
// Context
// ============================================================================

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const [data, setData] = useState<OnboardingData>(INITIAL_DATA);
  const [visitedSteps, setVisitedSteps] = useState<Set<string>>(
    new Set(["welcome"])
  );

  const currentStep = pathname?.split("/").pop() || "welcome";
  const currentStepIndex = ONBOARDING_STEPS.indexOf(
    currentStep as OnboardingStep
  );

  const updateData = useCallback(
    <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => {
      setData((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const canAccessStep = useCallback(
    (step: string) => {
      const stepIndex = ONBOARDING_STEPS.indexOf(step as OnboardingStep);
      if (stepIndex === -1) return false;
      if (stepIndex === 0) return true;
      // Can only access if previous step was visited
      const prevStep = ONBOARDING_STEPS[stepIndex - 1];
      return visitedSteps.has(prevStep);
    },
    [visitedSteps]
  );

  const goToStep = useCallback(
    (step: string) => {
      if (canAccessStep(step)) {
        router.push(`/onboarding/${step}`);
      }
    },
    [canAccessStep, router]
  );

  const goNext = useCallback(() => {
    if (currentStepIndex < ONBOARDING_STEPS.length - 1) {
      const nextStep = ONBOARDING_STEPS[currentStepIndex + 1];
      setVisitedSteps((prev) => new Set([...prev, currentStep]));
      router.push(`/onboarding/${nextStep}`);
    }
  }, [currentStepIndex, currentStep, router]);

  const goBack = useCallback(() => {
    if (currentStepIndex > 0) {
      const prevStep = ONBOARDING_STEPS[currentStepIndex - 1];
      router.push(`/onboarding/${prevStep}`);
    }
  }, [currentStepIndex, router]);

  const skip = useCallback(() => {
    startTransition(async () => {
      await skipOnboardingAction();
    });
  }, []);

  const value = useMemo(
    () => ({
      data,
      visitedSteps,
      updateData,
      canAccessStep,
      goToStep,
      goNext,
      goBack,
      skip,
      isSkipping: isPending,
      currentStepIndex,
      totalSteps: ONBOARDING_STEPS.length,
      isFirstStep: currentStepIndex === 0,
      isLastStep: currentStepIndex === ONBOARDING_STEPS.length - 1,
    }),
    [
      data,
      visitedSteps,
      updateData,
      canAccessStep,
      goToStep,
      goNext,
      goBack,
      skip,
      isPending,
      currentStepIndex,
    ]
  );

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error("useOnboarding must be used within OnboardingProvider");
  }
  return context;
}
