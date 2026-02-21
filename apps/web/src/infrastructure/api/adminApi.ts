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
	}),
});

export const { useGetAdminStatsQuery, useGetAdminUsersQuery } = adminApi;
