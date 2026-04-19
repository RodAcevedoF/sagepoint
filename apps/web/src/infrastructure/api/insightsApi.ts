import { baseApi } from "./baseApi";

export interface NewsArticleDto {
  id: string;
  title: string;
  description: string;
  url: string;
  imageUrl: string | null;
  source: string;
  publishedAt: string;
  categoryId: string;
  categorySlug: string;
  createdAt: string;
}

export const insightsApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getInsights: builder.query<NewsArticleDto[], void>({
      query: () => "/insights",
      providesTags: ["Insights"],
    }),
    getPublicInsights: builder.query<NewsArticleDto[], void>({
      query: () => "/insights/public",
      providesTags: ["Insights"],
    }),
  }),
});

export const { useGetInsightsQuery, useGetPublicInsightsQuery } = insightsApi;
