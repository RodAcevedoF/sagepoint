'use client';

import { useRouter } from 'next/navigation';
import { useSubmitOnboardingMutation } from '@/infrastructure/api/onboardingApi';
import type { OnboardingData } from '@/features/onboarding/context/OnboardingContext';

export function useSubmitOnboardingCommand() {
  const [submitMutation, { isLoading, error }] = useSubmitOnboardingMutation();
  const router = useRouter();

  const execute = async (data: OnboardingData) => {
    await submitMutation({
      goal: data.goal,
      experience: data.experience,
      interests: data.interests,
      weeklyHours: data.weeklyHours,
      status: 'COMPLETED',
    }).unwrap();
    router.push('/dashboard');
  };

  return { execute, isLoading, error };
}
