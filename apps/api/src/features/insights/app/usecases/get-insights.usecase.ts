import { NewsArticle } from '@sagepoint/domain';
import type {
  IUserRepository,
  IRoadmapRepository,
  ICategoryRepository,
  ICacheService,
  INewsArticleRepository,
  INewsService,
} from '@sagepoint/domain';
import { randomUUID } from 'crypto';

const INSIGHTS_CACHE_TTL = 600; // 10 minutes

function userInsightsKey(userId: string): string {
  return `insights:${userId}`;
}

export class GetInsightsUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly roadmapRepo: IRoadmapRepository,
    private readonly categoryRepo: ICategoryRepository,
    private readonly cache: ICacheService,
    private readonly newsArticleRepo: INewsArticleRepository,
    private readonly newsService: INewsService,
  ) {}

  async execute(userId: string): Promise<NewsArticle[]> {
    const cacheKey = userInsightsKey(userId);
    const cached = await this.cache.get<NewsArticle[]>(cacheKey);
    if (cached) return cached;

    const user = await this.userRepo.findById(userId);
    if (!user) return [];

    // Collect categories from user interests + roadmaps
    const categoryMap = new Map<string, { id: string; name: string }>();
    for (const interest of user.interests) {
      categoryMap.set(interest.slug, { id: interest.id, name: interest.name });
    }

    const roadmaps = await this.roadmapRepo.findByUserId(userId);
    if (roadmaps.length > 0) {
      const allCategories = await this.categoryRepo.list();
      const catById = new Map(allCategories.map((c) => [c.id, c]));

      for (const roadmap of roadmaps) {
        if (roadmap.categoryId) {
          const cat = catById.get(roadmap.categoryId);
          if (cat) categoryMap.set(cat.slug, { id: cat.id, name: cat.name });
        }
      }
    }

    if (categoryMap.size === 0) return [];

    const slugs = [...categoryMap.keys()];
    let articles = await this.newsArticleRepo.findByCategorySlugs(slugs);

    // Identify categories with no articles and fetch on-demand
    const coveredSlugs = new Set(articles.map((a) => a.categorySlug));
    const missingSlugs = slugs.filter((s) => !coveredSlugs.has(s));

    if (missingSlugs.length > 0) {
      const fetched = await this.fetchAndPersist(missingSlugs, categoryMap);
      articles = [...articles, ...fetched];
      articles.sort(
        (a, b) => b.publishedAt.getTime() - a.publishedAt.getTime(),
      );
    }

    if (articles.length > 0) {
      await this.cache.set(cacheKey, articles, INSIGHTS_CACHE_TTL);
    }

    return articles;
  }

  private async fetchAndPersist(
    slugs: string[],
    categoryMap: Map<string, { id: string; name: string }>,
  ): Promise<NewsArticle[]> {
    const allFetched: NewsArticle[] = [];

    for (const slug of slugs) {
      const cat = categoryMap.get(slug);
      if (!cat) continue;

      try {
        const raw = await this.newsService.fetchByCategory(slug, cat.name);
        if (raw.length === 0) continue;

        const articles = raw.map(
          (a) =>
            new NewsArticle(
              randomUUID(),
              a.title,
              a.description,
              a.url,
              a.imageUrl,
              a.source,
              a.publishedAt,
              cat.id,
              slug,
            ),
        );

        await this.newsArticleRepo.upsertMany(articles);
        allFetched.push(...articles);
      } catch {
        // Log failure but continue with other categories
      }
    }

    return allFetched;
  }
}
