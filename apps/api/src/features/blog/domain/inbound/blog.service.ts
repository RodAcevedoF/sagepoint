import type {
  BlogPost,
  PaginatedResult,
  PaginationParams,
} from '@sagepoint/domain';

export const BLOG_SERVICE = Symbol('BLOG_SERVICE');

export interface IBlogService {
  listPublished(
    params?: Partial<PaginationParams>,
  ): Promise<PaginatedResult<BlogPost>>;
  getBySlug(slug: string): Promise<BlogPost | null>;
}
