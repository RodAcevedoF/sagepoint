'use client';

import { useRouter } from 'next/navigation';
import {
	useGenerateTopicRoadmapMutation,
	type GenerateTopicRoadmapDto,
} from '@/infrastructure/api/roadmapApi';

interface GenerateOptions {
	navigateOnSuccess?: boolean;
	userContext?: GenerateTopicRoadmapDto['userContext'];
}

export function useGenerateTopicRoadmapCommand() {
	const [generateMutation, { isLoading, error }] = useGenerateTopicRoadmapMutation();
	const router = useRouter();

	const execute = async (
		topic: string,
		title?: string,
		options?: GenerateOptions,
	) => {
		const body: GenerateTopicRoadmapDto = {
			topic,
			title: title || undefined,
			userContext: options?.userContext,
		};
		const roadmap = await generateMutation(body).unwrap();
		if (options?.navigateOnSuccess) {
			router.push(`/roadmaps/${roadmap.id}`);
		}
		return roadmap;
	};

	return { execute, isLoading, error };
}
