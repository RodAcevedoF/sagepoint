import { baseApi } from './baseApi';

export type OnboardingStatus = 'PENDING' | 'COMPLETED' | 'SKIPPED';

export interface UserDto {
  id: string;
  email: string;
  name: string;
  role: string;
  avatarUrl?: string;
  learningGoal?: string;
  onboardingStatus?: OnboardingStatus;
  interests?: { id: string; name: string; slug: string }[];
}

export interface LoginResponseDto {
  accessToken: string;
  refreshToken: string;
  user: UserDto;
}

export interface RegisterResponseDto {
  message: string;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponseDto, { email: string; password: string }>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User'],
    }),
    register: builder.mutation<RegisterResponseDto, { email: string; password: string; name: string }>({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
    }),
    getProfile: builder.query<UserDto, void>({
      query: () => '/auth/me',
      providesTags: ['User'],
    }),
  }),
});

export const { useLoginMutation, useRegisterMutation, useGetProfileQuery } = authApi;
