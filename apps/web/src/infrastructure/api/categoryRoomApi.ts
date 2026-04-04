import { baseApi } from "./baseApi";
import type { RoadmapDto } from "./roadmapApi";

export interface CategoryRoomDto {
  id: string;
  name: string;
  slug: string;
  description?: string;
  roadmapCount: number;
  memberCount: number;
}

export interface CategoryRoomDetailDto {
  category: { id: string; name: string; slug: string; description?: string };
  roadmapCount: number;
  memberCount: number;
  roadmaps: { items: RoadmapDto[]; total: number };
}

export const categoryRoomApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getCategoryRooms: builder.query<CategoryRoomDto[], void>({
      query: () => "/categories/rooms",
      providesTags: ["Category"],
    }),
    getCategoryRoomDetail: builder.query<
      CategoryRoomDetailDto,
      { slug: string; search?: string; page?: number; pageSize?: number }
    >({
      query: ({ slug, ...params }) => ({
        url: `/categories/rooms/${slug}`,
        params,
      }),
      providesTags: (_r, _e, { slug }) => [{ type: "Category", id: slug }],
    }),
  }),
});

export const { useGetCategoryRoomsQuery, useGetCategoryRoomDetailQuery } =
  categoryRoomApi;
