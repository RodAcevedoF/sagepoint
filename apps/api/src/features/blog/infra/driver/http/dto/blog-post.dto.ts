import type { BlogPost, BlogPostSourceRef } from '@sagepoint/domain';

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

export function toBlogPostDto(post: BlogPost): BlogPostDto {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    contentMarkdown: post.contentMarkdown,
    heroImageUrl: post.heroImageUrl,
    categoryId: post.categoryId,
    categorySlug: post.categorySlug,
    author: post.author,
    source: post.source,
    sources: post.sources,
    publishedAt: new Date(post.publishedAt).toISOString(),
  };
}
