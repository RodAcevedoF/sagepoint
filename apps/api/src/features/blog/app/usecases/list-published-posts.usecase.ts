import type {
  BlogPost,
  IBlogPostRepository,
  ICacheService,
  PaginatedResult,
  PaginationParams,
} from '@sagepoint/domain';

const CACHE_TTL = 600;
const CACHE_KEY = ({ page, limit }: PaginationParams) =>
  `blog:list:p${page}:l${limit}`;

export class ListPublishedPostsUseCase {
  constructor(
    private readonly blogPostRepo: IBlogPostRepository,
    private readonly cache: ICacheService,
  ) {}

  async execute(params: PaginationParams): Promise<PaginatedResult<BlogPost>> {
    const key = CACHE_KEY(params);
    const cached = await this.cache.get<PaginatedResult<BlogPost>>(key);
    if (cached) return cached;

    const result = await this.blogPostRepo.listPublished(params);
    if (result.data.length > 0) {
      await this.cache.set(key, result, CACHE_TTL);
    }
    return result;
  }
}
