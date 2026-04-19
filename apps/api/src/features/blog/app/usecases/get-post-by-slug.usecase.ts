import type {
  BlogPost,
  IBlogPostRepository,
  ICacheService,
} from '@sagepoint/domain';

const CACHE_TTL = 600;
const CACHE_KEY = (slug: string) => `blog:post:${slug}`;

export class GetPostBySlugUseCase {
  constructor(
    private readonly blogPostRepo: IBlogPostRepository,
    private readonly cache: ICacheService,
  ) {}

  async execute(slug: string): Promise<BlogPost | null> {
    const key = CACHE_KEY(slug);
    const cached = await this.cache.get<BlogPost | null>(key);
    if (cached !== null && cached !== undefined) return cached;

    const post = await this.blogPostRepo.findBySlug(slug);
    if (post) {
      await this.cache.set(key, post, CACHE_TTL);
    }
    return post;
  }
}
