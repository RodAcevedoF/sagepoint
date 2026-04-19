import type { IBlogService } from '../../domain/inbound/blog.service';
import type { BlogPost } from '@sagepoint/domain';
import { ListPublishedPostsUseCase } from '../../app/usecases/list-published-posts.usecase';
import { GetPostBySlugUseCase } from '../../app/usecases/get-post-by-slug.usecase';

export class BlogService implements IBlogService {
  constructor(
    private readonly listPublishedUseCase: ListPublishedPostsUseCase,
    private readonly getPostBySlugUseCase: GetPostBySlugUseCase,
  ) {}

  listPublished(limit = 10): Promise<BlogPost[]> {
    return this.listPublishedUseCase.execute(limit);
  }

  getBySlug(slug: string): Promise<BlogPost | null> {
    return this.getPostBySlugUseCase.execute(slug);
  }
}
