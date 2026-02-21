'use client';

import { useGetAdminUsersQuery } from '@/infrastructure/api/adminApi';

export function useAdminUsersQuery() {
  return useGetAdminUsersQuery();
}
