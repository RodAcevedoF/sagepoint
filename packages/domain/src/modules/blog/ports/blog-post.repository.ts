import type { BlogPost } from "../entities/blog-post.entity";

export const BLOG_POST_REPOSITORY = Symbol("BLOG_POST_REPOSITORY");

export interface IBlogPostRepository {
  save(post: BlogPost): Promise<BlogPost>;
  findBySlug(slug: string): Promise<BlogPost | null>;
  listPublished(limit: number): Promise<BlogPost[]>;
  findLatestByCategoryId(categoryId: string): Promise<BlogPost | null>;
}
