import type { ICacheService, INewsArticleRepository } from '@sagepoint/domain';
import { NewsArticle } from '@sagepoint/domain';

const CACHE_TTL = 600;

export class GetPublicInsightsUseCase {
  constructor(
    private readonly cache: ICacheService,
    private readonly newsArticleRepo: INewsArticleRepository,
  ) {}

  async execute(limit = 13): Promise<NewsArticle[]> {
    const cacheKey = `insights:public:${limit}`;
    const cached = await this.cache.get<NewsArticle[]>(cacheKey);
    if (cached) return cached;

    const articles = await this.newsArticleRepo.findRecent(limit);
    if (articles.length > 0) {
      await this.cache.set(cacheKey, articles, CACHE_TTL);
    }
    return articles;
  }
}
