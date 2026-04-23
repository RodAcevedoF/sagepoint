import { Injectable, Logger, Inject } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
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
const REFRESH_INTERVAL_DAYS = 3;
const MAX_NEWS_CATEGORIES = 20;

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
    private readonly configService: ConfigService,
  ) {}

  @Cron("0 23 * * *")
  async refreshNewsCache(force = false) {
    if (!force && this.configService.get("NEWS_REFRESH_ENABLED") !== "true") {
      this.logger.log("News refresh disabled by config — skipping");
      return;
    }

    this.logger.log("Starting news refresh...");
    const startedAt = Date.now();

    let categories = await this.categoryRepo.list();
    if (categories.length > MAX_NEWS_CATEGORIES) {
      this.logger.warn(
        `${categories.length} categories exceed cap of ${MAX_NEWS_CATEGORIES} — fetching only the first ${MAX_NEWS_CATEGORIES}`,
      );
      categories = categories.slice(0, MAX_NEWS_CATEGORIES);
    }

    const freshSince = new Date();
    freshSince.setUTCDate(freshSince.getUTCDate() - REFRESH_INTERVAL_DAYS);

    let totalSaved = 0;
    let categoriesProcessed = 0;
    let categoriesEmpty = 0;
    let categoriesFailed = 0;
    let categoriesSkipped = 0;

    for (const category of categories) {
      try {
        const alreadyFetched =
          await this.newsArticleRepo.countByCategoryCreatedSince(
            category.id,
            freshSince,
          );
        if (alreadyFetched > 0) {
          this.logger.log(
            `Skipping ${category.name} — refreshed within last ${REFRESH_INTERVAL_DAYS} days (${alreadyFetched} articles)`,
          );
          categoriesSkipped++;
          continue;
        }

        const fetched = await this.newsService.fetchByCategory(
          category.slug,
          category.name,
        );

        if (fetched.length === 0) {
          this.logger.log(`No articles found for ${category.name}`);
          categoriesEmpty++;
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
        categoriesProcessed++;
        this.logger.log(
          `Saved ${articles.length} articles for ${category.name}`,
        );
      } catch (error) {
        categoriesFailed++;
        this.logger.error(
          `Failed to refresh news for ${category.name}`,
          error instanceof Error ? error.stack : undefined,
        );
      }
    }

    const totalPurged = await this.purgeOldArticles();

    this.logger.log("News refresh complete", {
      categoriesTotal: categories.length,
      categoriesProcessed,
      categoriesSkipped,
      categoriesEmpty,
      categoriesFailed,
      totalSaved,
      totalPurged,
      durationMs: Date.now() - startedAt,
    });
  }

  private async purgeOldArticles(): Promise<number> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - RETENTION_DAYS);

    const count = await this.newsArticleRepo.deleteOlderThan(cutoff);

    this.logger.log(
      `Purged ${count} articles older than ${RETENTION_DAYS} days`,
    );

    return count;
  }
}
