import { baseApi } from './baseApi';

export interface NewsArticleDto {
  title: string;
  description: string;
  url: string;
  imageUrl: string | null;
  source: string;
  publishedAt: string;
  categorySlug: string;
}

export const insightsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getInsights: builder.query<NewsArticleDto[], void>({
      query: () => '/insights',
      providesTags: ['Insights'],
    }),
  }),
});

export const { useGetInsightsQuery } = insightsApi;
