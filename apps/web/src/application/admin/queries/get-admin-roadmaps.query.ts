'use client';

import { useGetAdminRoadmapsQuery } from '@/infrastructure/api/adminApi';

export function useAdminRoadmapsQuery(params: {
	status?: string;
	categoryId?: string;
	page?: number;
	limit?: number;
}) {
	return useGetAdminRoadmapsQuery(params);
}
