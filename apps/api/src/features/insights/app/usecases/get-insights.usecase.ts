import type {
  IUserRepository,
  IRoadmapRepository,
  ICategoryRepository,
  ICacheService,
  INewsService,
  NewsArticle,
} from '@sagepoint/domain';

const NEWS_CACHE_TTL = 43200; // 12 hours

export class GetInsightsUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly roadmapRepo: IRoadmapRepository,
    private readonly categoryRepo: ICategoryRepository,
    private readonly cache: ICacheService,
    private readonly newsService: INewsService,
  ) {}

  async execute(userId: string): Promise<NewsArticle[]> {
    const user = await this.userRepo.findById(userId);
    if (!user) return [];

    // Collect category slugs from user interests
    const categorySlugs = new Map<string, string>();
    for (const interest of user.interests) {
      categorySlugs.set(interest.slug, interest.name);
    }

    // Collect category slugs from user roadmaps
    const roadmaps = await this.roadmapRepo.findByUserId(userId);
    if (roadmaps.length > 0) {
      const allCategories = await this.categoryRepo.list();
      const categoryMap = new Map(allCategories.map((c) => [c.id, c]));

      for (const roadmap of roadmaps) {
        if (roadmap.categoryId) {
          const cat = categoryMap.get(roadmap.categoryId);
          if (cat) categorySlugs.set(cat.slug, cat.name);
        }
      }
    }

    if (categorySlugs.size === 0) return [];

    // Fetch articles per category (cache-aside)
    const allArticles: NewsArticle[] = [];

    for (const [slug, name] of categorySlugs) {
      const cacheKey = `news:${slug}`;
      const cached = await this.cache.get<NewsArticle[]>(cacheKey);

      if (cached) {
        allArticles.push(...cached);
        continue;
      }

      const articles = await this.newsService.fetchByCategory(slug, name);
      if (articles.length > 0) {
        await this.cache.set(cacheKey, articles, NEWS_CACHE_TTL);
      }
      allArticles.push(...articles);
    }

    // Sort by publishedAt desc, limit 20
    return allArticles
      .sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
      )
      .slice(0, 20);
  }
}
