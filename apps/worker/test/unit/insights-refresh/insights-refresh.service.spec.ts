import { InsightsRefreshService } from "../../../src/insights-refresh/insights-refresh.service";
import { NewsArticle } from "@sagepoint/domain";
import { FakePrismaClient } from "../_fakes/prisma.fake";
import { FakeCacheService, FakeNewsService } from "../_fakes/services.fake";

function buildArticle(title: string): NewsArticle {
  return new NewsArticle(
    title,
    "Description",
    "https://example.com",
    null,
    "Source",
    "2026-01-01",
    "test",
  );
}

function buildService(overrides?: {
  cache?: FakeCacheService;
  newsService?: FakeNewsService;
  prisma?: FakePrismaClient;
}) {
  const cache = overrides?.cache ?? new FakeCacheService();
  const newsService = overrides?.newsService ?? new FakeNewsService();
  const prisma = overrides?.prisma ?? new FakePrismaClient();

  const service = Object.create(
    InsightsRefreshService.prototype,
  ) as InsightsRefreshService;
  Object.defineProperty(service, "cache", { value: cache });
  Object.defineProperty(service, "newsService", { value: newsService });
  Object.defineProperty(service, "prisma", { value: prisma });
  Object.defineProperty(service, "logger", {
    value: { log: () => {}, error: () => {}, warn: () => {} },
  });

  return { service, cache, newsService, prisma };
}

describe("InsightsRefreshService", () => {
  let service: InsightsRefreshService;
  let cache: FakeCacheService;
  let newsService: FakeNewsService;
  let prisma: FakePrismaClient;

  beforeEach(() => {
    const ctx = buildService();
    service = ctx.service;
    cache = ctx.cache;
    newsService = ctx.newsService;
    prisma = ctx.prisma;
  });

  describe("refreshNewsCache", () => {
    it("should fetch and cache articles for each category", async () => {
      prisma.seedCategory({ id: "cat-1", name: "AI", slug: "ai" });
      prisma.seedCategory({ id: "cat-2", name: "Web Dev", slug: "web-dev" });

      newsService.setArticles("ai", [
        buildArticle("AI News 1"),
        buildArticle("AI News 2"),
      ]);
      newsService.setArticles("web-dev", [buildArticle("Web News")]);

      await service.refreshNewsCache();

      const today = new Date().toISOString().split("T")[0];
      expect(cache.has(`news:ai:${today}`)).toBe(true);
      expect(cache.has(`news:web-dev:${today}`)).toBe(true);
    });

    it("should skip categories that already have cached news for today", async () => {
      prisma.seedCategory({ id: "cat-1", name: "AI", slug: "ai" });

      const today = new Date().toISOString().split("T")[0];
      cache.seed(`news:ai:${today}`, [buildArticle("Already cached")]);

      newsService.setArticles("ai", [buildArticle("New article")]);

      await service.refreshNewsCache();

      const cached = await cache.get<NewsArticle[]>(`news:ai:${today}`);
      expect(cached?.[0].title).toBe("Already cached");
    });

    it("should not cache empty article arrays", async () => {
      prisma.seedCategory({ id: "cat-1", name: "AI", slug: "ai" });
      newsService.setArticles("ai", []);

      await service.refreshNewsCache();

      const today = new Date().toISOString().split("T")[0];
      expect(cache.has(`news:ai:${today}`)).toBe(false);
    });

    it("should continue processing other categories when one fails", async () => {
      const failingService = new FakeNewsService();
      const ctx = buildService({ newsService: failingService });
      ctx.prisma.seedCategory({ id: "cat-1", name: "AI", slug: "ai" });
      ctx.prisma.seedCategory({
        id: "cat-2",
        name: "Web Dev",
        slug: "web-dev",
      });

      let callCount = 0;
      Object.defineProperty(failingService, "fetchByCategory", {
        value: (slug: string) => {
          callCount++;
          if (slug === "ai") return Promise.reject(new Error("API error"));
          return Promise.resolve([buildArticle("Web article")]);
        },
      });

      await ctx.service.refreshNewsCache();

      const today = new Date().toISOString().split("T")[0];
      expect(ctx.cache.has(`news:ai:${today}`)).toBe(false);
      expect(ctx.cache.has(`news:web-dev:${today}`)).toBe(true);
      expect(callCount).toBe(2);
    });

    it("should handle empty category list gracefully", async () => {
      await expect(service.refreshNewsCache()).resolves.toBeUndefined();
    });
  });
});
