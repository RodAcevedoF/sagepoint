'use client';

import { useGetAdminDocumentsQuery } from '@/infrastructure/api/adminApi';

export function useAdminDocumentsQuery(params: {
	stage?: string;
	status?: string;
	page?: number;
	limit?: number;
}) {
	return useGetAdminDocumentsQuery(params);
}
