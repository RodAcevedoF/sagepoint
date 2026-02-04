import { baseApi } from './baseApi';
import { UserDto } from './authApi';

export interface UpdateUserDto {
  name?: string;
  avatarUrl?: string;
  learningGoal?: string;
  // Add other updateable fields as needed
}

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    updateProfile: builder.mutation<UserDto, UpdateUserDto>({
      query: (data) => ({
        url: '/users/me',
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const { useUpdateProfileMutation } = userApi;
