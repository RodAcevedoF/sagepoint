import { baseApi } from './baseApi';

export interface AdminStatsDto {
	userCount: number;
	documentCount: number;
	roadmapCount: number;
	quizCount: number;
	documentsByStage: Record<string, number>;
}

export interface AdminUserDto {
	id: string;
	email: string;
	name: string;
	role: string;
	createdAt: string;
	onboardingStatus: string;
}

export interface HealthCheckResult {
	status: string;
	info: Record<string, { status: string }>;
	error: Record<string, { status: string; message?: string }>;
	details: Record<string, { status: string; message?: string }>;
}

export interface QueueInfo {
	name: string;
	counts: {
		waiting: number;
		active: number;
		completed: number;
		failed: number;
		delayed: number;
	};
	recentFailures: Array<{
		id: string | undefined;
		name: string;
		failedReason: string | undefined;
		timestamp: number;
	}>;
}

export interface QueueStatsResponse {
	documentQueue: QueueInfo;
	roadmapQueue: QueueInfo;
}

export const adminApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		getAdminStats: builder.query<AdminStatsDto, void>({
			query: () => '/admin/stats',
			providesTags: ['AdminStats'],
		}),
		getAdminUsers: builder.query<AdminUserDto[], void>({
			query: () => '/admin/users',
			providesTags: ['AdminStats'],
		}),
		getHealthCheck: builder.query<HealthCheckResult, void>({
			query: () => '/health',
		}),
		getQueueStats: builder.query<QueueStatsResponse, void>({
			query: () => '/admin/queue-stats',
		}),
	}),
});

export const {
	useGetAdminStatsQuery,
	useGetAdminUsersQuery,
	useGetHealthCheckQuery,
	useGetQueueStatsQuery,
} = adminApi;
