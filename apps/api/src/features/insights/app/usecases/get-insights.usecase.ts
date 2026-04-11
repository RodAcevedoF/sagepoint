import { NewsArticle } from '@sagepoint/domain';
import type {
  IUserRepository,
  IRoadmapRepository,
  ICategoryRepository,
  ICacheService,
  INewsArticleRepository,
} from '@sagepoint/domain';

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
    const articles = await this.newsArticleRepo.findByCategorySlugs(slugs);

    if (articles.length > 0) {
      await this.cache.set(cacheKey, articles, INSIGHTS_CACHE_TTL);
    }

    return articles;
  }
}
