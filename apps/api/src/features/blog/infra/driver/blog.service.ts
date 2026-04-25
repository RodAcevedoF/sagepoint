import type { IBlogService } from '../../domain/inbound/blog.service';
import type {
  BlogPost,
  PaginatedResult,
  PaginationParams,
} from '@sagepoint/domain';
import { ListPublishedPostsUseCase } from '../../app/usecases/list-published-posts.usecase';
import { GetPostBySlugUseCase } from '../../app/usecases/get-post-by-slug.usecase';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 12;

export class BlogService implements IBlogService {
  constructor(
    private readonly listPublishedUseCase: ListPublishedPostsUseCase,
    private readonly getPostBySlugUseCase: GetPostBySlugUseCase,
  ) {}

  listPublished(
    params: Partial<PaginationParams> = {},
  ): Promise<PaginatedResult<BlogPost>> {
    return this.listPublishedUseCase.execute({
      page: params.page ?? DEFAULT_PAGE,
      limit: params.limit ?? DEFAULT_LIMIT,
    });
  }

  getBySlug(slug: string): Promise<BlogPost | null> {
    return this.getPostBySlugUseCase.execute(slug);
  }
}
