'use client';

import { useGetProfileQuery } from '@/infrastructure/api/authApi';

export function useProfileQuery(options?: { skip?: boolean }) {
  return useGetProfileQuery(undefined, options);
}
