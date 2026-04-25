import type { PaginatedResult } from "@sagepoint/domain";
import { baseApi } from "./baseApi";

export interface BlogPostSourceRef {
  title: string;
  url: string;
  source: string;
}

export interface BlogPostDto {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  contentMarkdown: string;
  heroImageUrl: string | null;
  categoryId: string;
  categorySlug: string;
  author: string;
  source: string;
  sources: BlogPostSourceRef[];
  publishedAt: string;
}

export interface GetBlogPostsArgs {
  page?: number;
  limit?: number;
}

export const blogApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getBlogPosts: builder.query<
      PaginatedResult<BlogPostDto>,
      GetBlogPostsArgs | void
    >({
      query: (args) => ({
        url: "/blog",
        params: args ? { page: args.page, limit: args.limit } : undefined,
      }),
      providesTags: ["Blog"],
    }),
    getBlogPostBySlug: builder.query<BlogPostDto, string>({
      query: (slug) => `/blog/${slug}`,
      providesTags: (_result, _err, slug) => [{ type: "Blog", id: slug }],
    }),
  }),
});

export const { useGetBlogPostsQuery, useGetBlogPostBySlugQuery } = blogApi;
