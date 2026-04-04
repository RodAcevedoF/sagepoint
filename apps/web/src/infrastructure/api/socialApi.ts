import { baseApi } from "./baseApi";

export interface LikeStatusDto {
  liked: boolean;
  likeCount: number;
}

export const socialApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    toggleLike: builder.mutation<LikeStatusDto, string>({
      query: (roadmapId) => ({
        url: `/likes/roadmaps/${roadmapId}`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, roadmapId) => [
        { type: "Like", id: roadmapId },
        { type: "Like", id: "LIST" },
      ],
    }),

    getLikeStatus: builder.query<LikeStatusDto, string>({
      query: (roadmapId) => `/likes/roadmaps/${roadmapId}/status`,
      providesTags: (_result, _error, roadmapId) => [
        { type: "Like", id: roadmapId },
      ],
    }),

    getLikeCountsBatch: builder.query<Record<string, number>, string[]>({
      query: (ids) => `/likes/roadmaps/counts?ids=${ids.join(",")}`,
      providesTags: (_result, _error, ids) =>
        ids.map((id) => ({ type: "Like" as const, id })),
    }),

    getLikedRoadmaps: builder.query<unknown[], void>({
      query: () => "/likes/me",
      providesTags: [{ type: "Like", id: "LIST" }],
    }),
  }),
});

export const {
  useToggleLikeMutation,
  useGetLikeStatusQuery,
  useGetLikeCountsBatchQuery,
  useGetLikedRoadmapsQuery,
} = socialApi;
