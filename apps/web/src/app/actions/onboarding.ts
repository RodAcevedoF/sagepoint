'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface OnboardingActionState {
  error?: string;
  success?: boolean;
}

export interface OnboardingData {
  goal: string;
  experience: string;
  interests: string[];
  weeklyHours: string;
}

async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('access_token')?.value || null;
}

export async function completeOnboardingAction(
  data: OnboardingData
): Promise<OnboardingActionState> {
  const token = await getAuthToken();

  if (!token) {
    return { error: 'Not authenticated' };
  }

  try {
    const response = await fetch(`${API_URL}/users/me/onboarding`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        learningGoal: data.goal,
        experienceLevel: data.experience,
        interests: data.interests,
        weeklyHoursGoal: parseInt(data.weeklyHours) || null,
        status: 'COMPLETED',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { error: errorData.message || 'Failed to save onboarding data' };
    }

    return { success: true };
  } catch {
    return { error: 'Network error. Please try again.' };
  }
}

export async function skipOnboardingAction(): Promise<OnboardingActionState> {
  const token = await getAuthToken();

  if (!token) {
    return { error: 'Not authenticated' };
  }

  try {
    const response = await fetch(`${API_URL}/users/me/onboarding`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        status: 'SKIPPED',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { error: errorData.message || 'Failed to skip onboarding' };
    }

  } catch {
    return { error: 'Network error. Please try again.' };
  }

  redirect('/dashboard');
}
