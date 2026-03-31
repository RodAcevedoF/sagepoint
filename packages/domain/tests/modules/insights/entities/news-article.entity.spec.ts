import { NewsArticle } from "../../../../src";

const FIXED_DATE = new Date("2026-01-01T00:00:00.000Z");

describe("NewsArticle", () => {
  describe("constructor", () => {
    it("stores all required fields with null imageUrl", () => {
      const article = new NewsArticle(
        "a1",
        "TS 5.0 Released",
        "Major new features arrived",
        "https://example.com/ts5",
        null,
        "TypeScript Blog",
        FIXED_DATE,
        "cat-1",
        "typescript",
        FIXED_DATE,
      );

      expect(article.id).toBe("a1");
      expect(article.title).toBe("TS 5.0 Released");
      expect(article.description).toBe("Major new features arrived");
      expect(article.url).toBe("https://example.com/ts5");
      expect(article.imageUrl).toBeNull();
      expect(article.source).toBe("TypeScript Blog");
      expect(article.publishedAt).toBe(FIXED_DATE);
      expect(article.categoryId).toBe("cat-1");
      expect(article.categorySlug).toBe("typescript");
      expect(article.createdAt).toBe(FIXED_DATE);
    });

    it("stores a non-null imageUrl", () => {
      const article = new NewsArticle(
        "a2",
        "Article",
        "Desc",
        "https://example.com",
        "https://example.com/img.png",
        "Source",
        FIXED_DATE,
        "cat-1",
        "slug",
        FIXED_DATE,
      );

      expect(article.imageUrl).toBe("https://example.com/img.png");
    });

    it("uses a default createdAt when not provided", () => {
      const before = Date.now();
      const article = new NewsArticle(
        "a3",
        "Title",
        "Desc",
        "https://example.com",
        null,
        "Source",
        FIXED_DATE,
        "cat-1",
        "slug",
      );
      const after = Date.now();

      expect(article.createdAt.getTime()).toBeGreaterThanOrEqual(before);
      expect(article.createdAt.getTime()).toBeLessThanOrEqual(after);
    });
  });
});
