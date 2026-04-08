import { baseApi } from "./baseApi";

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
  isActive: boolean;
  isVerified: boolean;
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

export interface AdminRoadmapDto {
  id: string;
  title: string;
  generationStatus: string;
  isFeatured: boolean;
  visibility: string;
  createdAt: string;
  user: { id: string; name: string; email: string };
  category: { id: string; name: string } | null;
}

export interface AdminDocumentDto {
  id: string;
  filename: string;
  status: string;
  processingStage: string;
  fileSize: number | null;
  createdAt: string;
  user: { id: string; name: string; email: string };
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface AnalyticsTimePoint {
  date: string;
  count: number;
}

export interface AnalyticsDto {
  signups: AnalyticsTimePoint[];
  uploads: AnalyticsTimePoint[];
  generations: AnalyticsTimePoint[];
}

export interface AdminInvitationDto {
  id: string;
  email: string;
  token: string;
  role: string;
  status: string;
  expiresAt: string;
  createdAt: string;
  invitedBy: { id: string; name: string };
  acceptedBy: { id: string; name: string } | null;
}

export interface DirectUserDto {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface UserResourceLimitsDto {
  userId: string;
  maxDocuments: number | null;
  maxRoadmaps: number | null;
}

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminStats: builder.query<AdminStatsDto, void>({
      query: () => "/admin/stats",
      providesTags: ["AdminStats"],
    }),
    getAdminUsers: builder.query<AdminUserDto[], void>({
      query: () => "/admin/users",
      providesTags: ["AdminUsers"],
    }),
    deleteAdminUser: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/admin/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["AdminUsers", "AdminStats"],
    }),
    updateAdminUser: builder.mutation<
      AdminUserDto,
      { id: string; data: { role?: string; isActive?: boolean } }
    >({
      query: ({ id, data }) => ({
        url: `/admin/users/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["AdminUsers", "AdminStats"],
    }),
    getHealthCheck: builder.query<HealthCheckResult, void>({
      query: () => "/health",
    }),
    getQueueStats: builder.query<QueueStatsResponse, void>({
      query: () => "/admin/queue-stats",
    }),
    getAdminRoadmaps: builder.query<
      PaginatedResponse<AdminRoadmapDto>,
      { status?: string; categoryId?: string; page?: number; limit?: number }
    >({
      query: (params) => ({
        url: "/admin/roadmaps",
        params,
      }),
      providesTags: ["AdminRoadmaps"],
    }),
    deleteAdminRoadmap: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/admin/roadmaps/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["AdminRoadmaps", "AdminStats"],
    }),
    toggleRoadmapFeatured: builder.mutation<
      { id: string; isFeatured: boolean },
      string
    >({
      query: (id) => ({
        url: `/admin/roadmaps/${id}`,
        method: "PATCH",
      }),
      invalidatesTags: ["AdminRoadmaps"],
    }),
    getAdminDocuments: builder.query<
      PaginatedResponse<AdminDocumentDto>,
      { stage?: string; status?: string; page?: number; limit?: number }
    >({
      query: (params) => ({
        url: "/admin/documents",
        params,
      }),
      providesTags: ["AdminDocuments"],
    }),
    deleteAdminDocument: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/admin/documents/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["AdminDocuments", "AdminStats"],
    }),
    getAdminAnalytics: builder.query<AnalyticsDto, { days?: number }>({
      query: (params) => ({
        url: "/admin/analytics",
        params,
      }),
    }),
    getAdminInvitations: builder.query<AdminInvitationDto[], void>({
      query: () => "/invitations",
      providesTags: ["AdminInvitations"],
    }),
    createInvitation: builder.mutation<
      AdminInvitationDto,
      { email: string; role?: string }
    >({
      query: (body) => ({
        url: "/invitations",
        method: "POST",
        body,
      }),
      invalidatesTags: ["AdminInvitations"],
    }),
    revokeInvitation: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/invitations/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["AdminInvitations"],
    }),
    createUserDirect: builder.mutation<
      DirectUserDto,
      { email: string; name: string; password: string; role?: string }
    >({
      query: (body) => ({
        url: "/invitations/direct",
        method: "POST",
        body,
      }),
      invalidatesTags: ["AdminUsers", "AdminStats"],
    }),
    getUserLimits: builder.query<UserResourceLimitsDto, string>({
      query: (id) => `/admin/users/${id}/limits`,
      providesTags: ["AdminUsers"],
    }),
    updateUserLimits: builder.mutation<
      UserResourceLimitsDto,
      {
        id: string;
        data: { maxDocuments?: number | null; maxRoadmaps?: number | null };
      }
    >({
      query: ({ id, data }) => ({
        url: `/admin/users/${id}/limits`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["AdminUsers"],
    }),
  }),
});

export const {
  useGetAdminStatsQuery,
  useGetAdminUsersQuery,
  useUpdateAdminUserMutation,
  useGetHealthCheckQuery,
  useGetQueueStatsQuery,
  useGetAdminRoadmapsQuery,
  useDeleteAdminRoadmapMutation,
  useToggleRoadmapFeaturedMutation,
  useGetAdminDocumentsQuery,
  useDeleteAdminDocumentMutation,
  useGetAdminAnalyticsQuery,
  useGetAdminInvitationsQuery,
  useCreateInvitationMutation,
  useRevokeInvitationMutation,
  useCreateUserDirectMutation,
  useDeleteAdminUserMutation,
  useGetUserLimitsQuery,
  useUpdateUserLimitsMutation,
} = adminApi;
