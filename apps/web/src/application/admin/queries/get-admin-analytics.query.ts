'use client';

import { useGetAdminAnalyticsQuery } from '@/infrastructure/api/adminApi';

export function useAdminAnalyticsQuery(params: { days?: number }) {
	return useGetAdminAnalyticsQuery(params);
}
