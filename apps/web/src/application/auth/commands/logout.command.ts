'use client';

import { useRouter } from 'next/navigation';
import { logout } from '@/infrastructure/store/slices/authSlice';
import { useAppDispatch } from '@/common/hooks';

export function useLogoutCommand() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const execute = () => {
    dispatch(logout());
    router.push('/login');
  };

  return { execute };
}
