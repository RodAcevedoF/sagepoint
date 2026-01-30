'use client';

import { useGetCategoriesQuery } from '@/infrastructure/api/onboardingApi';

export function useCategoriesQuery() {
  return useGetCategoriesQuery();
}
