import { Injectable, Logger, Inject } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { PrismaClient, PrismaPg } from "@sagepoint/database";
import type { ICacheService, INewsService } from "@sagepoint/domain";
import { NEWS_SERVICE } from "@sagepoint/domain";

const NEWS_CACHE_TTL = 86400; // 24 hours

function todayKey(slug: string): string {
  const date = new Date().toISOString().split("T")[0];
  return `news:${slug}:${date}`;
}

@Injectable()
export class InsightsRefreshService {
  private readonly logger = new Logger(InsightsRefreshService.name);
  private readonly prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
  });

  constructor(
    @Inject("WORKER_CACHE") private readonly cache: ICacheService,
    @Inject(NEWS_SERVICE) private readonly newsService: INewsService,
  ) {}

  @Cron("0 6 * * *")
  async refreshNewsCache() {
    this.logger.log("Starting daily news cache refresh...");

    const categories = await this.prisma.category.findMany();

    for (const category of categories) {
      const cacheKey = todayKey(category.slug);

      // Skip if today's news already cached
      const existing = await this.cache.get(cacheKey);
      if (existing) {
        this.logger.log(`Already fresh for ${category.name}, skipping`);
        continue;
      }

      try {
        const articles = await this.newsService.fetchByCategory(
          category.slug,
          category.name,
        );

        if (articles.length > 0) {
          await this.cache.set(cacheKey, articles, NEWS_CACHE_TTL);
        }

        this.logger.log(
          `Refreshed ${articles.length} articles for ${category.name}`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to refresh news for ${category.name}`,
          error instanceof Error ? error.stack : undefined,
        );
      }
    }

    this.logger.log("Daily news cache refresh complete");
  }
}
