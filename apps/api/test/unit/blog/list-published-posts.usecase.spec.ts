import { ListPublishedPostsUseCase } from '../../../src/features/blog/app/usecases/list-published-posts.usecase';
import {
  BlogPost,
  BlogPostSource,
  type IBlogPostRepository,
  type PaginatedResult,
  type PaginationParams,
} from '@sagepoint/domain';
import { FakeCacheService } from '../_fakes/repositories';

function makePost(slug: string, publishedAt: Date): BlogPost {
  return new BlogPost(
    `id-${slug}`,
    slug,
    `Title ${slug}`,
    `Excerpt ${slug}`,
    `# Body ${slug}`,
    null,
    'cat-1',
    'web-development',
    'Sagepoint Team',
    BlogPostSource.STATIC,
    [],
    publishedAt,
    publishedAt,
  );
}

class FakeBlogPostRepository implements IBlogPostRepository {
  private posts: BlogPost[] = [];

  seed(...posts: BlogPost[]) {
    this.posts.push(...posts);
  }

  save(post: BlogPost): Promise<BlogPost> {
    this.posts.push(post);
    return Promise.resolve(post);
  }

  findBySlug(slug: string): Promise<BlogPost | null> {
    return Promise.resolve(this.posts.find((p) => p.slug === slug) ?? null);
  }

  listPublished({
    page,
    limit,
  }: PaginationParams): Promise<PaginatedResult<BlogPost>> {
    const sorted = [...this.posts].sort(
      (a, b) => b.publishedAt.getTime() - a.publishedAt.getTime(),
    );
    const skip = (page - 1) * limit;
    return Promise.resolve({
      data: sorted.slice(skip, skip + limit),
      total: sorted.length,
      page,
      limit,
    });
  }

  findLatestByCategoryId(categoryId: string): Promise<BlogPost | null> {
    const matches = this.posts.filter((p) => p.categoryId === categoryId);
    return Promise.resolve(
      matches.sort(
        (a, b) => b.publishedAt.getTime() - a.publishedAt.getTime(),
      )[0] ?? null,
    );
  }
}

describe('ListPublishedPostsUseCase', () => {
  let repo: FakeBlogPostRepository;
  let cache: FakeCacheService;

  beforeEach(() => {
    repo = new FakeBlogPostRepository();
    cache = new FakeCacheService();
    for (let i = 0; i < 25; i++) {
      const date = new Date(2026, 0, i + 1);
      repo.seed(makePost(`post-${String(i).padStart(2, '0')}`, date));
    }
  });

  it('returns the first page ordered by publishedAt desc with total count', async () => {
    const useCase = new ListPublishedPostsUseCase(repo, cache);

    const result = await useCase.execute({ page: 1, limit: 12 });

    expect(result.total).toBe(25);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(12);
    expect(result.data).toHaveLength(12);
    expect(result.data[0].slug).toBe('post-24');
    expect(result.data[11].slug).toBe('post-13');
  });

  it('paginates correctly on subsequent pages', async () => {
    const useCase = new ListPublishedPostsUseCase(repo, cache);

    const page2 = await useCase.execute({ page: 2, limit: 12 });
    expect(page2.data).toHaveLength(12);
    expect(page2.data[0].slug).toBe('post-12');

    const page3 = await useCase.execute({ page: 3, limit: 12 });
    expect(page3.data).toHaveLength(1);
    expect(page3.data[0].slug).toBe('post-00');
  });

  it('caches results per (page, limit) combination', async () => {
    const useCase = new ListPublishedPostsUseCase(repo, cache);

    await useCase.execute({ page: 1, limit: 12 });
    await useCase.execute({ page: 2, limit: 12 });

    expect(cache.has('blog:list:p1:l12')).toBe(true);
    expect(cache.has('blog:list:p2:l12')).toBe(true);
  });

  it('does not cache empty pages', async () => {
    const useCase = new ListPublishedPostsUseCase(repo, cache);

    await useCase.execute({ page: 99, limit: 12 });

    expect(cache.has('blog:list:p99:l12')).toBe(false);
  });
});
