'use client';

import { useRouter } from 'next/navigation';
import { useSubmitOnboardingMutation } from '@/infrastructure/api/onboardingApi';

export function useSubmitOnboardingCommand() {
  const [submitMutation, { isLoading, error }] = useSubmitOnboardingMutation();
  const router = useRouter();

  const execute = async (goal: string, interests: string[]) => {
    await submitMutation({ goal, interests }).unwrap();
    router.push('/dashboard');
  };

  return { execute, isLoading, error };
}
