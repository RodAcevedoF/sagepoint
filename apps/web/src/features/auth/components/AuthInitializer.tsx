'use client';

import { useEffect } from 'react';
import { useGetProfileQuery } from '../api/authApi';
import { useAppDispatch } from '@/common/store/store';

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  // Poll/Fetch profile to keep user state in sync and react to tag invalidation
  // skip: false ensures it runs. We can add skip logic e.g. if no token, 
  // but baseApi handles that (returns error which is fine).
  const { data: user, error, isLoading } = useGetProfileQuery(undefined, {
      pollingInterval: 0, // Don't poll, rely on invalidation
      refetchOnFocus: true, // Good practice
      refetchOnReconnect: true
  });

  // The slice matcher handles updating state.auth.user
  
  return <>{children}</>;
}
