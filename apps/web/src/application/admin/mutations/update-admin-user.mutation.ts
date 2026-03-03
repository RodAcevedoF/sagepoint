'use client';

import { useUpdateAdminUserMutation } from '@/infrastructure/api/adminApi';

export function useUpdateAdminUserMutation_() {
	return useUpdateAdminUserMutation();
}
