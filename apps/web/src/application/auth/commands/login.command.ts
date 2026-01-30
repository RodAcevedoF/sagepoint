'use client';

import { useRouter } from 'next/navigation';
import { useLoginMutation } from '@/infrastructure/api/authApi';
import { setCredentials } from '@/infrastructure/store/slices/authSlice';
import { useAppDispatch } from '@/common/hooks';

export function useLoginCommand() {
  const dispatch = useAppDispatch();
  const [loginMutation, { isLoading, error }] = useLoginMutation();
  const router = useRouter();

  const execute = async (email: string, password: string) => {
    const result = await loginMutation({ email, password }).unwrap();
    dispatch(setCredentials({ user: result.user, token: result.accessToken }));
    router.push('/dashboard');
  };

  return { execute, isLoading, error };
}
