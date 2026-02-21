'use client';

import { useRouter } from 'next/navigation';
import { useSubmitOnboardingMutation } from '@/infrastructure/api/onboardingApi';
import { useGenerateTopicRoadmapMutation } from '@/infrastructure/api/roadmapApi';
import type { OnboardingData } from '@/features/onboarding/context/OnboardingContext';

export function useSubmitOnboardingCommand() {
  const [submitMutation, { isLoading, error }] = useSubmitOnboardingMutation();
  const [generateRoadmap] = useGenerateTopicRoadmapMutation();
  const router = useRouter();

  const execute = async (data: OnboardingData) => {
    await submitMutation({
      goal: data.goal,
      experience: data.experience,
      interests: data.interests,
      weeklyHours: data.weeklyHours,
      status: 'COMPLETED',
    }).unwrap();

    // Generate first roadmap from user's goal (now async — returns skeleton immediately)
    if (data.goal) {
      const result = await generateRoadmap({
        topic: data.goal,
        userContext: data.experience
          ? { experienceLevel: data.experience as 'beginner' | 'intermediate' | 'advanced' | 'expert' }
          : undefined,
      }).unwrap();

      router.push(`/dashboard?creating=roadmap&roadmapId=${result.id}`);
      return;
    }

    router.push('/dashboard?creating=roadmap');
  };

  return { execute, isLoading, error };
}
