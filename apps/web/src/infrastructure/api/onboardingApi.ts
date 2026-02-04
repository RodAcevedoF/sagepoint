import { baseApi } from './baseApi';

export interface CategoryDto {
  id: string;
  name: string;
  slug: string;
}

export const onboardingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<CategoryDto[], void>({
      query: () => '/categories',
      providesTags: ['Category'],
    }),
    submitOnboarding: builder.mutation<
      { success: true },
      {
        goal: string;
        experience: string;
        interests: string[];
        weeklyHours: string;
        status: 'COMPLETED' | 'SKIPPED';
      }
    >({
      query: (data) => ({
        url: '/users/me/onboarding',
        method: 'POST',
        body: {
          learningGoal: data.goal,
          experienceLevel: data.experience,
          interests: data.interests,
          weeklyHoursGoal: parseInt(data.weeklyHours) || null,
          status: data.status,
        },
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const { useGetCategoriesQuery, useSubmitOnboardingMutation } = onboardingApi;
