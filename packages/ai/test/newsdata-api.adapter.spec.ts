import { NewsdataApiAdapter } from "../src/newsdata-api.adapter";
import { NewsArticle } from "@sagepoint/domain";

const successResponse = (results: unknown[]) => ({
  ok: true,
  status: 200,
  json: async () => ({
    status: "success",
    totalResults: results.length,
    results,
  }),
  text: async () => "",
});

const errorResponse = (status: number, body: string) => ({
  ok: false,
  status,
  json: async () => ({}),
  text: async () => body,
});

describe("NewsdataApiAdapter", () => {
  let adapter: NewsdataApiAdapter;
  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    adapter = new NewsdataApiAdapter({ apiKey: "nd-test-key" });
    fetchSpy = jest.spyOn(globalThis, "fetch");
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  describe("fetchByCategory", () => {
    it("returns mapped NewsArticle instances", async () => {
      fetchSpy.mockResolvedValue(
        successResponse([
          {
            title: "React 20 Released",
            description: "New features in React",
            link: "https://example.com/react",
            image_url: "https://img.example.com/react.jpg",
            source_name: "TechBlog",
            pubDate: "2026-03-01",
            ai_summary: "React 20 brings improvements",
            duplicate: false,
          },
        ]),
      );

      const result = await adapter.fetchByCategory(
        "web-development",
        "Web Development",
      );

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(NewsArticle);
      expect(result[0].title).toBe("React 20 Released");
      expect(result[0].description).toBe("React 20 brings improvements");
      expect(result[0].url).toBe("https://example.com/react");
    });

    it("uses category search map for known slugs", async () => {
      fetchSpy.mockResolvedValue(successResponse([]));

      await adapter.fetchByCategory("machine-learning", "ML");

      const url = fetchSpy.mock.calls[0][0] as string;
      expect(url).toContain("machine+learning+OR+deep+learning");
    });

    it("falls back to category name for unknown slugs", async () => {
      fetchSpy.mockResolvedValue(successResponse([]));

      await adapter.fetchByCategory("unknown-slug", "Custom Category");

      const url = fetchSpy.mock.calls[0][0] as string;
      expect(url).toContain("Custom+Category");
    });

    it("prefers ai_summary over description", async () => {
      fetchSpy.mockResolvedValue(
        successResponse([
          {
            title: "Article",
            description: "ONLY AVAILABLE IN PAID PLANS",
            link: "https://example.com",
            image_url: null,
            source_name: "Src",
            pubDate: "2026-01-01",
            ai_summary: "AI generated summary",
            duplicate: false,
          },
        ]),
      );

      const result = await adapter.fetchByCategory("devops", "DevOps");
      expect(result[0].description).toBe("AI generated summary");
    });

    it("falls back to description when ai_summary is paid-only", async () => {
      fetchSpy.mockResolvedValue(
        successResponse([
          {
            title: "Article",
            description: "Actual description",
            link: "https://example.com",
            image_url: null,
            source_name: "Src",
            pubDate: "2026-01-01",
            ai_summary: "ONLY AVAILABLE IN PAID PLANS",
            duplicate: false,
          },
        ]),
      );

      const result = await adapter.fetchByCategory("devops", "DevOps");
      expect(result[0].description).toBe("Actual description");
    });

    it("returns empty string description when both are paid-only", async () => {
      fetchSpy.mockResolvedValue(
        successResponse([
          {
            title: "Article",
            description: "ONLY AVAILABLE IN PAID PLANS",
            link: "https://example.com",
            image_url: null,
            source_name: "Src",
            pubDate: "2026-01-01",
            ai_summary: null,
            duplicate: false,
          },
        ]),
      );

      const result = await adapter.fetchByCategory("devops", "DevOps");
      expect(result[0].description).toBe("");
    });

    it("filters out articles without title or link", async () => {
      fetchSpy.mockResolvedValue(
        successResponse([
          {
            title: null,
            link: "https://a.com",
            description: null,
            image_url: null,
            source_name: "S",
            pubDate: "2026-01-01",
            ai_summary: null,
            duplicate: false,
          },
          {
            title: "Good",
            link: "https://b.com",
            description: null,
            image_url: null,
            source_name: "S",
            pubDate: "2026-01-01",
            ai_summary: null,
            duplicate: false,
          },
        ]),
      );

      const result = await adapter.fetchByCategory("databases", "Databases");
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe("Good");
    });

    it("limits results to 5", async () => {
      const articles = Array.from({ length: 8 }, (_, i) => ({
        title: `Article ${i}`,
        link: `https://example.com/${i}`,
        description: null,
        image_url: null,
        source_name: "S",
        pubDate: "2026-01-01",
        ai_summary: null,
        duplicate: false,
      }));
      fetchSpy.mockResolvedValue(successResponse(articles));

      const result = await adapter.fetchByCategory("devops", "DevOps");
      expect(result).toHaveLength(5);
    });

    it("returns empty array on HTTP error", async () => {
      fetchSpy.mockResolvedValue(errorResponse(429, "Rate limited"));

      const result = await adapter.fetchByCategory("devops", "DevOps");
      expect(result).toEqual([]);
    });

    it("returns empty array on network error", async () => {
      fetchSpy.mockRejectedValue(new Error("Network error"));

      const result = await adapter.fetchByCategory("devops", "DevOps");
      expect(result).toEqual([]);
    });

    it("returns empty array when status is not success", async () => {
      fetchSpy.mockResolvedValue({
        ok: true,
        json: async () => ({ status: "error", results: null }),
        text: async () => "",
      });

      const result = await adapter.fetchByCategory("devops", "DevOps");
      expect(result).toEqual([]);
    });
  });
});
