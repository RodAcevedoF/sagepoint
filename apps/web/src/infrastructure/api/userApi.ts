import { baseApi } from "./baseApi";
import { UserDto } from "./authApi";

export interface UpdateUserDto {
  name?: string;
  avatarUrl?: string;
  learningGoal?: string;
  interests?: string[];
}

interface UploadResult {
  path: string;
  url?: string;
}

export interface ResourceQuotaDto {
  documents: { used: number; max: number | null; remaining: number | null };
  roadmaps: { used: number; max: number | null; remaining: number | null };
}

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    updateProfile: builder.mutation<UserDto, UpdateUserDto>({
      query: (data) => ({
        url: "/users/me",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["User", "Insights"],
    }),
    resetOnboarding: builder.mutation<{ success: boolean }, void>({
      query: () => ({
        url: "/users/me/onboarding",
        method: "POST",
        body: { status: "PENDING" },
      }),
      invalidatesTags: ["User"],
    }),
    getResourceQuota: builder.query<ResourceQuotaDto, void>({
      query: () => "/users/me/quota",
      providesTags: ["User"],
    }),
    uploadAvatar: builder.mutation<UploadResult, File>({
      query: (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("category", "avatars");
        formData.append("isPublic", "true");
        return {
          url: "/storage/upload",
          method: "POST",
          body: formData,
        };
      },
    }),
  }),
});

export const {
  useUpdateProfileMutation,
  useResetOnboardingMutation,
  useUploadAvatarMutation,
  useGetResourceQuotaQuery,
} = userApi;
