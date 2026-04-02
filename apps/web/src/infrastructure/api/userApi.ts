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

export const { useUpdateProfileMutation, useUploadAvatarMutation } = userApi;
