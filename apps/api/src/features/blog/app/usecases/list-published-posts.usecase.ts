import type {
  BlogPost,
  IBlogPostRepository,
  ICacheService,
} from '@sagepoint/domain';

const CACHE_TTL = 600;
const CACHE_KEY = (limit: number) => `blog:list:${limit}`;

export class ListPublishedPostsUseCase {
  constructor(
    private readonly blogPostRepo: IBlogPostRepository,
    private readonly cache: ICacheService,
  ) {}

  async execute(limit: number): Promise<BlogPost[]> {
    const key = CACHE_KEY(limit);
    const cached = await this.cache.get<BlogPost[]>(key);
    if (cached) return cached;

    const posts = await this.blogPostRepo.listPublished(limit);
    if (posts.length > 0) {
      await this.cache.set(key, posts, CACHE_TTL);
    }
    return posts;
  }
}
