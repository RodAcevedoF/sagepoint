'use client';

import {
	useGenerateStepQuizMutation,
	useSubmitStepQuizMutation,
} from '@/infrastructure/api/roadmapApi';
import type {
	StepQuizQuestionDto,
	GenerateStepQuizResponseDto,
} from '@/infrastructure/api/roadmapApi';

export interface PreGeneratedQuiz {
	attemptId: string;
	questions: StepQuizQuestionDto[];
}

export function useStepQuizCommand() {
	const [generateMutation, { isLoading: isGenerating }] = useGenerateStepQuizMutation();
	const [submitMutation, { isLoading: isSubmitting }] = useSubmitStepQuizMutation();

	const generate = async (
		roadmapId: string,
		conceptId: string,
	): Promise<GenerateStepQuizResponseDto> => {
		return generateMutation({ roadmapId, conceptId }).unwrap();
	};

	const submit = async (
		roadmapId: string,
		attemptId: string,
		answers: Record<number, string>,
	) => {
		return submitMutation({ roadmapId, attemptId, answers }).unwrap();
	};

	return { generate, submit, isGenerating, isSubmitting };
}
