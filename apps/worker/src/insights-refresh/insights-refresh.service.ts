import { Injectable, Logger, Inject } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import type {
  ICategoryRepository,
  INewsArticleRepository,
  INewsService,
} from "@sagepoint/domain";
import {
  CATEGORY_REPOSITORY,
  NEWS_ARTICLE_REPOSITORY,
  NEWS_SERVICE,
  NewsArticle,
} from "@sagepoint/domain";
import { randomUUID } from "crypto";

const RETENTION_DAYS = 5;

@Injectable()
// @TODO: Add distributed locking if we ever have multiple worker instances to prevent duplicate refreshes.
// @TODO: this files violates ports and adapters architecture
export class InsightsRefreshService {
  private readonly logger = new Logger(InsightsRefreshService.name);

  constructor(
    @Inject(NEWS_SERVICE) private readonly newsService: INewsService,
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepo: ICategoryRepository,
    @Inject(NEWS_ARTICLE_REPOSITORY)
    private readonly newsArticleRepo: INewsArticleRepository,
  ) {}

  @Cron("0 6 * * *")
  async refreshNewsCache() {
    this.logger.log("Starting daily news refresh...");

    const categories = await this.categoryRepo.list();
    let totalSaved = 0;

    for (const category of categories) {
      try {
        const fetched = await this.newsService.fetchByCategory(
          category.slug,
          category.name,
        );

        if (fetched.length === 0) {
          this.logger.log(`No articles found for ${category.name}`);
          continue;
        }

        const articles = fetched.map(
          (a) =>
            new NewsArticle(
              randomUUID(),
              a.title,
              a.description,
              a.url,
              a.imageUrl,
              a.source,
              a.publishedAt,
              category.id,
              category.slug,
            ),
        );

        await this.newsArticleRepo.upsertMany(articles);
        totalSaved += articles.length;
        this.logger.log(
          `Saved ${articles.length} articles for ${category.name}`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to refresh news for ${category.name}`,
          error instanceof Error ? error.stack : undefined,
        );
      }
    }

    this.logger.log(
      `Daily news refresh complete — ${totalSaved} articles saved`,
    );

    await this.purgeOldArticles();
  }

  private async purgeOldArticles() {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - RETENTION_DAYS);

    const count = await this.newsArticleRepo.deleteOlderThan(cutoff);

    if (count > 0) {
      this.logger.log(
        `Purged ${count} articles older than ${RETENTION_DAYS} days`,
      );
    }
  }
}
