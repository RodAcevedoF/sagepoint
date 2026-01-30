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
