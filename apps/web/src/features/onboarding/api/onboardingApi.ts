import { baseApi } from '@/common/api/baseApi';

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export const onboardingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<Category[], void>({
      query: () => '/categories',
      providesTags: ['Category'],
    }),
    submitOnboarding: builder.mutation<{ success: true }, { goal: string; interests: string[] }>({
      query: (data) => ({
        url: '/users/onboarding',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const { useGetCategoriesQuery, useSubmitOnboardingMutation } = onboardingApi;
