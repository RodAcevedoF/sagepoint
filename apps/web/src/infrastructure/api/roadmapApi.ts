import type {
	RoadmapStep,
	RoadmapGenerationStatus,
	StepStatus,
	ResourceType,
	RoadmapProgressSummary,
} from '@sagepoint/domain';
import { baseApi } from './baseApi';

// DTOs
export interface GraphNodeDto {
	id: string;
	name: string;
	documentId: string;
	description?: string;
}

export interface GraphEdgeDto {
	from: string;
	to: string;
	type: string;
}

export interface GraphDataDto {
	nodes: GraphNodeDto[];
	edges: GraphEdgeDto[];
}

export interface RoadmapDto {
	id: string;
	title: string;
	documentId?: string;
	userId?: string;
	categoryId?: string;
	description?: string;
	steps: RoadmapStep[];
	generationStatus: RoadmapGenerationStatus;
	totalEstimatedDuration?: number;
	recommendedPace?: string;
	errorMessage?: string;
	createdAt: string;
}

export interface RoadmapWithProgressDto {
	roadmap: RoadmapDto;
	progress: RoadmapProgressSummary;
	stepProgress: Record<string, StepStatus>;
	resources: ResourceDto[];
}

export interface UserRoadmapDto {
	roadmap: RoadmapDto;
	progress: RoadmapProgressSummary;
}

export interface ResourceDto {
	id: string;
	title: string;
	url: string;
	type: ResourceType;
	description?: string;
	provider?: string;
	estimatedDuration?: number;
	difficulty?: string;
	conceptId: string;
	roadmapId: string;
	order: number;
	createdAt: string;
}

export interface UpdateProgressDto {
	roadmapId: string;
	conceptId: string;
	status: StepStatus;
}

export interface GenerateRoadmapDto {
	documentId: string;
	title?: string;
	userContext?: GenerateTopicRoadmapDto['userContext'];
}

export interface GenerateTopicRoadmapDto {
	topic: string;
	title?: string;
	userContext?: {
		experienceLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
		goal?: string;
	};
}

export interface SuggestedTopicDto {
	concept: { id: string; name: string; description?: string };
	relevance: string;
}

// Step Quiz DTOs
export interface StepQuizQuestionDto {
	index: number;
	text: string;
	type: string;
	options: { label: string; text: string }[];
	difficulty: string;
}

export interface GenerateStepQuizResponseDto {
	attemptId: string;
	questions: StepQuizQuestionDto[];
}

export interface QuestionResultDto {
	index: number;
	text: string;
	selectedAnswer: string;
	correctAnswer: string;
	isCorrect: boolean;
	explanation?: string;
}

export interface SubmitStepQuizResponseDto {
	passed: boolean;
	score: number;
	totalQuestions: number;
	correctAnswers: number;
	results: QuestionResultDto[];
}

export const roadmapApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		getGraph: builder.query<GraphDataDto, string>({
			query: (documentId) => `/roadmaps/graph/${documentId}`,
			providesTags: ['Graph'],
		}),

		// Roadmap endpoints
		getUserRoadmaps: builder.query<UserRoadmapDto[], void>({
			query: () => '/roadmaps/user/me',
			providesTags: (result) =>
				result ?
					[
						...result.map(({ roadmap }) => ({
							type: 'Roadmap' as const,
							id: roadmap.id,
						})),
						{ type: 'Roadmap', id: 'LIST' },
					]
				:	[{ type: 'Roadmap', id: 'LIST' }],
		}),
		getRoadmapById: builder.query<RoadmapDto, string>({
			query: (id) => `/roadmaps/${id}`,
			providesTags: (_result, _error, id) => [{ type: 'Roadmap', id }],
		}),
		getRoadmapWithProgress: builder.query<RoadmapWithProgressDto, string>({
			query: (id) => `/roadmaps/${id}/with-progress`,
			providesTags: (_result, _error, id) => [
				{ type: 'Roadmap', id },
				{ type: 'RoadmapProgress', id },
			],
		}),
		getRoadmapResources: builder.query<ResourceDto[], string>({
			query: (id) => `/roadmaps/${id}/resources`,
			providesTags: (_result, _error, id) => [{ type: 'Resource', id }],
		}),
		generateRoadmap: builder.mutation<RoadmapDto, GenerateRoadmapDto>({
			query: (body) => ({
				url: '/roadmaps',
				method: 'POST',
				body,
			}),
			invalidatesTags: [{ type: 'Roadmap', id: 'LIST' }],
		}),
		generateTopicRoadmap: builder.mutation<RoadmapDto, GenerateTopicRoadmapDto>({
			query: (body) => ({
				url: '/roadmaps/from-topic',
				method: 'POST',
				body,
			}),
			invalidatesTags: [{ type: 'Roadmap', id: 'LIST' }],
		}),
		updateStepProgress: builder.mutation<
			RoadmapProgressSummary,
			UpdateProgressDto
		>({
			query: ({ roadmapId, conceptId, status }) => ({
				url: `/roadmaps/${roadmapId}/steps/${conceptId}/progress`,
				method: 'PATCH',
				body: { status },
			}),
			invalidatesTags: (_result, _error, { roadmapId }) => [
				{ type: 'RoadmapProgress', id: roadmapId },
				{ type: 'Roadmap', id: 'LIST' },
			],
		}),
		refreshResources: builder.mutation<ResourceDto[], string>({
			query: (roadmapId) => ({
				url: `/roadmaps/${roadmapId}/refresh-resources`,
				method: 'POST',
			}),
			invalidatesTags: (_result, _error, roadmapId) => [
				{ type: 'Resource', id: roadmapId },
			],
		}),
		expandConcept: builder.mutation<RoadmapDto, { roadmapId: string; conceptId: string }>({
			query: ({ roadmapId, conceptId }) => ({
				url: `/roadmaps/${roadmapId}/steps/${conceptId}/expand`,
				method: 'POST',
			}),
			invalidatesTags: (_result, _error, { roadmapId }) => [
				{ type: 'Roadmap', id: roadmapId },
				{ type: 'RoadmapProgress', id: roadmapId },
			],
		}),
		getSuggestions: builder.query<SuggestedTopicDto[], string>({
			query: (roadmapId) => `/roadmaps/${roadmapId}/suggestions`,
			providesTags: (_result, _error, id) => [{ type: 'Roadmap', id }],
		}),

		// Step Quiz
		generateStepQuiz: builder.mutation<
			GenerateStepQuizResponseDto,
			{ roadmapId: string; conceptId: string }
		>({
			query: ({ roadmapId, conceptId }) => ({
				url: `/roadmaps/${roadmapId}/steps/${conceptId}/quiz`,
				method: 'POST',
			}),
		}),
		submitStepQuiz: builder.mutation<
			SubmitStepQuizResponseDto,
			{ roadmapId: string; attemptId: string; answers: Record<number, string> }
		>({
			query: ({ roadmapId, attemptId, answers }) => ({
				url: `/roadmaps/${roadmapId}/quiz/${attemptId}/submit`,
				method: 'POST',
				body: { answers },
			}),
			invalidatesTags: (_result, _error, { roadmapId }) => [
				{ type: 'RoadmapProgress', id: roadmapId },
				{ type: 'Roadmap', id: 'LIST' },
			],
		}),
	}),
});

export const {
	useLazyGetGraphQuery,
	// Roadmap
	useGetUserRoadmapsQuery,
	useGetRoadmapByIdQuery,
	useGetRoadmapWithProgressQuery,
	useGetRoadmapResourcesQuery,
	useLazyGetRoadmapResourcesQuery,
	useGenerateRoadmapMutation,
	useGenerateTopicRoadmapMutation,
	useUpdateStepProgressMutation,
	useRefreshResourcesMutation,
	useExpandConceptMutation,
	useGetSuggestionsQuery,
	useGenerateStepQuizMutation,
	useSubmitStepQuizMutation,
} = roadmapApi;
