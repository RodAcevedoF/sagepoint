import { InsightsRefreshService } from "../../../src/insights-refresh/insights-refresh.service";
import { NewsArticle } from "@sagepoint/domain";
import type {
  ICategoryRepository,
  INewsArticleRepository,
} from "@sagepoint/domain";
import { FakeNewsService } from "../_fakes/services.fake";
import { Category } from "@sagepoint/domain";
import type { ConfigService } from "@nestjs/config";

function buildArticle(title: string, slug: string): NewsArticle {
  return new NewsArticle(
    "",
    title,
    "Description",
    `https://example.com/${title.replace(/\s/g, "-")}`,
    null,
    "Source",
    new Date("2026-01-01"),
    "",
    slug,
  );
}

function fakeCategoryRepo(): ICategoryRepository & {
  seedCategory: (cat: Category) => void;
} {
  const categories: Category[] = [];
  return {
    list: () => Promise.resolve([...categories]),
    save: (c: Category) => Promise.resolve(c),
    findOrCreateBySlug: (c: Category) => Promise.resolve(c),
    findById: () => Promise.resolve(null),
    findBySlug: () => Promise.resolve(null),
    delete: () => Promise.resolve(),
    seedCategory: (cat: Category) => categories.push(cat),
  };
}

function fakeNewsArticleRepo(): INewsArticleRepository & {
  articles: NewsArticle[];
  deletedBefore: Date | null;
  existingByCategory: Map<string, number>;
} {
  const repo = {
    articles: [] as NewsArticle[],
    deletedBefore: null as Date | null,
    existingByCategory: new Map<string, number>(),
    upsertMany(articles: NewsArticle[]) {
      repo.articles.push(...articles);
      return Promise.resolve();
    },
    findByCategorySlugs() {
      return Promise.resolve([] as NewsArticle[]);
    },
    findRecent() {
      return Promise.resolve([] as NewsArticle[]);
    },
    deleteOlderThan(date: Date) {
      repo.deletedBefore = date;
      const before = repo.articles.length;
      repo.articles = repo.articles.filter((a) => a.createdAt >= date);
      return Promise.resolve(before - repo.articles.length);
    },
    countByCategoryCreatedSince(categoryId: string, _since: Date) {
      return Promise.resolve(repo.existingByCategory.get(categoryId) ?? 0);
    },
  };
  return repo;
}

function fakeConfigService(enabled: boolean): ConfigService {
  return {
    get: (key: string) =>
      key === "NEWS_REFRESH_ENABLED" ? String(enabled) : undefined,
  } as unknown as ConfigService;
}

function buildService(overrides?: {
  newsService?: FakeNewsService;
  categoryRepo?: ReturnType<typeof fakeCategoryRepo>;
  newsArticleRepo?: ReturnType<typeof fakeNewsArticleRepo>;
  enabled?: boolean;
}) {
  const newsService = overrides?.newsService ?? new FakeNewsService();
  const categoryRepo = overrides?.categoryRepo ?? fakeCategoryRepo();
  const newsArticleRepo = overrides?.newsArticleRepo ?? fakeNewsArticleRepo();
  const configService = fakeConfigService(overrides?.enabled ?? true);

  const service = new InsightsRefreshService(
    newsService,
    categoryRepo,
    newsArticleRepo,
    configService,
  );

  return { service, newsService, categoryRepo, newsArticleRepo };
}

describe("InsightsRefreshService", () => {
  describe("refreshNewsCache", () => {
    it("should fetch and persist articles for each category", async () => {
      const { service, newsService, categoryRepo, newsArticleRepo } =
        buildService();
      categoryRepo.seedCategory(Category.create("cat-1", "AI", "ai"));
      categoryRepo.seedCategory(Category.create("cat-2", "Web Dev", "web-dev"));

      newsService.setArticles("ai", [
        buildArticle("AI News 1", "ai"),
        buildArticle("AI News 2", "ai"),
      ]);
      newsService.setArticles("web-dev", [buildArticle("Web News", "web-dev")]);

      await service.refreshNewsCache();

      expect(newsArticleRepo.articles).toHaveLength(3);
    });

    it("should not persist when no articles are found", async () => {
      const { service, newsService, categoryRepo, newsArticleRepo } =
        buildService();
      categoryRepo.seedCategory(Category.create("cat-1", "AI", "ai"));
      newsService.setArticles("ai", []);

      await service.refreshNewsCache();

      expect(newsArticleRepo.articles).toHaveLength(0);
    });

    it("should continue processing other categories when one fails", async () => {
      const failingService = new FakeNewsService();
      const { service, categoryRepo, newsArticleRepo } = buildService({
        newsService: failingService,
      });
      categoryRepo.seedCategory(Category.create("cat-1", "AI", "ai"));
      categoryRepo.seedCategory(Category.create("cat-2", "Web Dev", "web-dev"));

      let callCount = 0;
      Object.defineProperty(failingService, "fetchByCategory", {
        value: (slug: string) => {
          callCount++;
          if (slug === "ai") return Promise.reject(new Error("API error"));
          return Promise.resolve([buildArticle("Web article", "web-dev")]);
        },
      });

      await service.refreshNewsCache();

      expect(newsArticleRepo.articles).toHaveLength(1);
      expect(callCount).toBe(2);
    });

    it("should purge old articles after refresh", async () => {
      const { service, newsArticleRepo, categoryRepo } = buildService();
      categoryRepo.seedCategory(Category.create("cat-1", "AI", "ai"));

      await service.refreshNewsCache();

      expect(newsArticleRepo.deletedBefore).toBeInstanceOf(Date);
    });

    it("should handle empty category list gracefully", async () => {
      const { service } = buildService();
      await expect(service.refreshNewsCache()).resolves.toBeUndefined();
    });

    it("should skip when NEWS_REFRESH_ENABLED is false and force is not set", async () => {
      const { service, newsService, categoryRepo, newsArticleRepo } =
        buildService({ enabled: false });
      categoryRepo.seedCategory(Category.create("cat-1", "AI", "ai"));
      newsService.setArticles("ai", [buildArticle("AI News", "ai")]);

      await service.refreshNewsCache();

      expect(newsArticleRepo.articles).toHaveLength(0);
    });

    it("should run when NEWS_REFRESH_ENABLED is false but force=true", async () => {
      const { service, newsService, categoryRepo, newsArticleRepo } =
        buildService({ enabled: false });
      categoryRepo.seedCategory(Category.create("cat-1", "AI", "ai"));
      newsService.setArticles("ai", [buildArticle("AI News", "ai")]);

      await service.refreshNewsCache(true);

      expect(newsArticleRepo.articles).toHaveLength(1);
    });

    it("should skip categories that already have articles created today", async () => {
      const { service, newsService, categoryRepo, newsArticleRepo } =
        buildService();
      const cat1 = Category.create("cat-1", "AI", "ai");
      const cat2 = Category.create("cat-2", "Web Dev", "web-dev");
      categoryRepo.seedCategory(cat1);
      categoryRepo.seedCategory(cat2);
      newsService.setArticles("ai", [buildArticle("AI News", "ai")]);
      newsService.setArticles("web-dev", [buildArticle("Web News", "web-dev")]);
      newsArticleRepo.existingByCategory.set("cat-1", 3);

      await service.refreshNewsCache();

      expect(newsArticleRepo.articles).toHaveLength(1);
      expect(newsArticleRepo.articles[0].categorySlug).toBe("web-dev");
    });

    it("should fetch all categories when none have articles today", async () => {
      const { service, newsService, categoryRepo, newsArticleRepo } =
        buildService();
      categoryRepo.seedCategory(Category.create("cat-1", "AI", "ai"));
      categoryRepo.seedCategory(Category.create("cat-2", "Web Dev", "web-dev"));
      newsService.setArticles("ai", [buildArticle("AI News", "ai")]);
      newsService.setArticles("web-dev", [buildArticle("Web News", "web-dev")]);

      await service.refreshNewsCache();

      expect(newsArticleRepo.articles).toHaveLength(2);
    });
  });
});
