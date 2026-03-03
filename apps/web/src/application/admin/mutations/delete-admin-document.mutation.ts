'use client';

import { useDeleteAdminDocumentMutation } from '@/infrastructure/api/adminApi';

export function useDeleteAdminDocumentMutation_() {
	return useDeleteAdminDocumentMutation();
}
