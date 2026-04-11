import { baseApi } from "./baseApi";
import { authApi } from "./authApi";

export interface CategoryDto {
  id: string;
  name: string;
  slug: string;
}

export const onboardingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<CategoryDto[], void>({
      query: () => "/categories",
      providesTags: ["Category"],
    }),
    submitOnboarding: builder.mutation<
      { success: true },
      {
        goal: string;
        experience: string;
        interests: string[];
        weeklyHours: string;
        status: "COMPLETED" | "SKIPPED";
      }
    >({
      query: (data) => ({
        url: "/users/me/onboarding",
        method: "POST",
        body: {
          learningGoal: data.goal,
          experienceLevel: data.experience,
          interests: data.interests,
          weeklyHoursGoal: parseInt(data.weeklyHours) || null,
          status: data.status,
        },
      }),
      invalidatesTags: ["User"],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          // Optimistically patch cached profile so Dashboard sees COMPLETED
          // immediately, without waiting for the tag-invalidation refetch.
          dispatch(
            authApi.util.updateQueryData("getProfile", undefined, (draft) => {
              draft.onboardingStatus = arg.status;
            }),
          );
        } catch {
          // Mutation failed — no patch needed
        }
      },
    }),
  }),
});

export const { useGetCategoriesQuery, useSubmitOnboardingMutation } =
  onboardingApi;
