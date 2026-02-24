'use client';

import { useRouter } from 'next/navigation';
import { useGenerateRoadmapMutation } from '@/infrastructure/api/roadmapApi';
import type { GenerateTopicRoadmapDto } from '@/infrastructure/api/roadmapApi';

export function useGenerateRoadmapCommand() {
	const [generateMutation, { isLoading, error }] = useGenerateRoadmapMutation();
	const router = useRouter();

	const execute = async (
		documentId: string,
		options?: {
			title?: string;
			userContext?: GenerateTopicRoadmapDto['userContext'];
			navigateOnSuccess?: boolean;
		},
	) => {
		const roadmap = await generateMutation({
			documentId,
			title: options?.title,
			userContext: options?.userContext,
		}).unwrap();
		if (options?.navigateOnSuccess) {
			router.push(`/roadmaps/${roadmap.id}`);
		}
		return roadmap;
	};

	return { execute, isLoading, error };
}
