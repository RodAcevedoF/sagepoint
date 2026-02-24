'use client';

import { useExpandConceptMutation } from '@/infrastructure/api/roadmapApi';

export function useExpandConceptCommand() {
	const [expandMutation, { isLoading, error }] = useExpandConceptMutation();

	const execute = async (roadmapId: string, conceptId: string) => {
		return await expandMutation({ roadmapId, conceptId }).unwrap();
	};

	return { execute, isLoading, error };
}
