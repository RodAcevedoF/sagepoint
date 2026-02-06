'use client';

import { useRouter } from 'next/navigation';
import { useGenerateRoadmapMutation } from '@/infrastructure/api/roadmapApi';

export function useGenerateRoadmapCommand() {
	const [generateMutation, { isLoading, error }] = useGenerateRoadmapMutation();
	const router = useRouter();

	const execute = async (
		documentId: string,
		options?: { navigateOnSuccess?: boolean },
	) => {
		const roadmap = await generateMutation({ documentId }).unwrap();
		if (options?.navigateOnSuccess) {
			router.push(`/roadmaps/${roadmap.id}`);
		}
		return roadmap;
	};

	return { execute, isLoading, error };
}
