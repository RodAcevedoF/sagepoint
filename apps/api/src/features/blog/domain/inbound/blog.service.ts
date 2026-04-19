import type { BlogPost } from '@sagepoint/domain';

export const BLOG_SERVICE = Symbol('BLOG_SERVICE');

export interface IBlogService {
  listPublished(limit?: number): Promise<BlogPost[]>;
  getBySlug(slug: string): Promise<BlogPost | null>;
}
