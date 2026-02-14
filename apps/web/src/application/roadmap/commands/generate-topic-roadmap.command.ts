'use client';

import { useRouter } from 'next/navigation';
import { useGenerateTopicRoadmapMutation } from '@/infrastructure/api/roadmapApi';

export function useGenerateTopicRoadmapCommand() {
	const [generateMutation, { isLoading, error }] = useGenerateTopicRoadmapMutation();
	const router = useRouter();

	const execute = async (
		topic: string,
		title?: string,
		options?: { navigateOnSuccess?: boolean },
	) => {
		const roadmap = await generateMutation({ topic, title: title || undefined }).unwrap();
		if (options?.navigateOnSuccess) {
			router.push(`/roadmaps/${roadmap.id}`);
		}
		return roadmap;
	};

	return { execute, isLoading, error };
}
