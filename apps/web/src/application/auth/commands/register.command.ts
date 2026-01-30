'use client';

import { useRouter } from 'next/navigation';
import { useRegisterMutation } from '@/infrastructure/api/authApi';

export function useRegisterCommand() {
  const [registerMutation, { isLoading, error }] = useRegisterMutation();
  const router = useRouter();

  const execute = async (name: string, email: string, password: string) => {
    await registerMutation({ email, password, name }).unwrap();
    router.push('/login?registered=true');
  };

  return { execute, isLoading, error };
}
