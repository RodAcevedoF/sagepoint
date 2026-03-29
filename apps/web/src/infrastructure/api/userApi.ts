import { baseApi } from "./baseApi";
import { UserDto } from "./authApi";

export interface UpdateUserDto {
  name?: string;
  avatarUrl?: string;
  learningGoal?: string;
  interests?: string[];
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
  }),
});

export const { useUpdateProfileMutation } = userApi;
