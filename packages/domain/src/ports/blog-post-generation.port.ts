export const BLOG_POST_GENERATION_SERVICE = Symbol(
  "BLOG_POST_GENERATION_SERVICE",
);

export interface BlogPostGenerationInput {
  categoryName: string;
  categorySlug: string;
  sourceArticles: Array<{
    title: string;
    description: string;
    url: string;
    source: string;
    publishedAt: Date;
  }>;
}

export interface BlogPostGenerationResult {
  title: string;
  excerpt: string;
  contentMarkdown: string;
  suggestedSlug: string;
}

export interface IBlogPostGenerationService {
  generate(input: BlogPostGenerationInput): Promise<BlogPostGenerationResult>;
}
