import type { ProcessingStage, QuestionType } from '@sagepoint/domain';
import { baseApi } from './baseApi';

// DTOs
export interface DocumentDetailDto {
	id: string;
	filename: string;
	status: string;
	storagePath: string;
	userId: string;
	processingStage: ProcessingStage;
	mimeType?: string;
	fileSize?: number;
	conceptCount?: number;
	createdAt: string;
	updatedAt: string;
}

export interface DocumentSummaryDto {
	id: string;
	documentId: string;
	overview: string;
	keyPoints: string[];
	topicArea: string;
	difficulty: string;
	estimatedReadTime?: number;
	conceptCount: number;
	createdAt: string;
}

export interface QuizDto {
	id: string;
	documentId: string;
	title: string;
	description?: string;
	questionCount: number;
	createdAt: string;
	updatedAt: string;
}

export interface QuestionOptionDto {
	label: string;
	text: string;
	isCorrect: boolean;
}

export interface QuestionDto {
	id: string;
	quizId: string;
	type: QuestionType;
	text: string;
	options: QuestionOptionDto[];
	explanation?: string;
	conceptId?: string;
	order: number;
	difficulty: string;
	createdAt: string;
}

export interface QuizWithQuestionsDto {
	quiz: QuizDto;
	questions: QuestionDto[];
}

export interface QuizAttemptDto {
	id: string;
	quizId: string;
	userId: string;
	answers: Record<string, string>;
	score: number;
	totalQuestions: number;
	correctAnswers: number;
	completedAt?: string;
	createdAt: string;
}

export interface SubmitQuizAttemptDto {
	answers: Record<string, string>;
}

export const documentApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		getUserDocuments: builder.query<DocumentDetailDto[], void>({
			query: () => '/documents/user/me',
			providesTags: (result) =>
				result ?
					[
						...result.map(({ id }) => ({
							type: 'Document' as const,
							id,
						})),
						{ type: 'Document', id: 'LIST' },
					]
				:	[{ type: 'Document', id: 'LIST' }],
		}),
		uploadDocument: builder.mutation<DocumentDetailDto, FormData>({
			query: (formData) => ({
				url: '/documents',
				method: 'POST',
				body: formData,
			}),
			invalidatesTags: [{ type: 'Document', id: 'LIST' }],
		}),
		getDocumentById: builder.query<DocumentDetailDto, string>({
			query: (id) => `/documents/${id}`,
			providesTags: (_result, _error, id) => [{ type: 'Document', id }],
		}),
		deleteDocument: builder.mutation<{ success: boolean }, string>({
			query: (id) => ({
				url: `/documents/${id}`,
				method: 'DELETE',
			}),
			invalidatesTags: [{ type: 'Document', id: 'LIST' }],
		}),
		getDocumentSummary: builder.query<DocumentSummaryDto | null, string>({
			query: (id) => `/documents/${id}/summary`,
			providesTags: (_result, _error, id) => [{ type: 'DocumentSummary', id }],
		}),
		getDocumentQuizzes: builder.query<QuizDto[], string>({
			query: (id) => `/documents/${id}/quizzes`,
			providesTags: (_result, _error, id) => [{ type: 'Quiz', id }],
		}),
		getQuizWithQuestions: builder.query<QuizWithQuestionsDto, { documentId: string; quizId: string }>({
			query: ({ documentId, quizId }) => `/documents/${documentId}/quizzes/${quizId}`,
			providesTags: (_result, _error, { quizId }) => [{ type: 'Quiz', id: quizId }],
		}),
		submitQuizAttempt: builder.mutation<QuizAttemptDto, { documentId: string; quizId: string; answers: Record<string, string> }>({
			query: ({ documentId, quizId, answers }) => ({
				url: `/documents/${documentId}/quizzes/${quizId}/attempt`,
				method: 'POST',
				body: { answers },
			}),
			invalidatesTags: (_result, _error, { quizId }) => [{ type: 'QuizAttempt', id: quizId }],
		}),
		getQuizAttempts: builder.query<QuizAttemptDto[], { documentId: string; quizId: string }>({
			query: ({ documentId, quizId }) => `/documents/${documentId}/quizzes/${quizId}/attempts`,
			providesTags: (_result, _error, { quizId }) => [{ type: 'QuizAttempt', id: quizId }],
		}),
	}),
});

export const {
	useGetUserDocumentsQuery,
	useUploadDocumentMutation,
	useGetDocumentByIdQuery,
	useDeleteDocumentMutation,
	useGetDocumentSummaryQuery,
	useGetDocumentQuizzesQuery,
	useGetQuizWithQuestionsQuery,
	useSubmitQuizAttemptMutation,
	useGetQuizAttemptsQuery,
} = documentApi;
