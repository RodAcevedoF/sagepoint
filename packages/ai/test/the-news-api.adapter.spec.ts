import { TheNewsApiAdapter } from "../src/the-news-api.adapter";
import { NewsArticle } from "@sagepoint/domain";

const successResponse = (data: unknown[]) => ({
  ok: true,
  status: 200,
  json: () => Promise.resolve({ data }),
  text: () => Promise.resolve(""),
});

const errorResponse = (status: number, body: string) => ({
  ok: false,
  status,
  json: () => Promise.resolve({}),
  text: () => Promise.resolve(body),
});

describe("TheNewsApiAdapter", () => {
  let adapter: TheNewsApiAdapter;
  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    adapter = new TheNewsApiAdapter({ apiKey: "tna-test-key" });
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
            title: "Kubernetes 2.0",
            description: "Major K8s update",
            url: "https://example.com/k8s",
            image_url: "https://img.example.com/k8s.jpg",
            source: "DevNews",
            published_at: "2026-03-10T12:00:00Z",
          },
        ]),
      );

      const result = await adapter.fetchByCategory("devops", "DevOps");

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(NewsArticle);
      expect(result[0].title).toBe("Kubernetes 2.0");
      expect(result[0].url).toBe("https://example.com/k8s");
      expect(result[0].source).toBe("DevNews");
    });

    it("uses category search map for known slugs", async () => {
      fetchSpy.mockResolvedValue(successResponse([]));

      await adapter.fetchByCategory("cybersecurity", "Security");

      const [url] = fetchSpy.mock.lastCall as [string];
      expect(url).toContain("cybersecurity");
    });

    it("falls back to category name for unknown slugs", async () => {
      fetchSpy.mockResolvedValue(successResponse([]));

      await adapter.fetchByCategory("unknown", "My Category");

      const [url] = fetchSpy.mock.lastCall as [string];
      expect(url).toContain("My+Category");
    });

    it("includes published_after parameter (7 days ago)", async () => {
      fetchSpy.mockResolvedValue(successResponse([]));

      await adapter.fetchByCategory("devops", "DevOps");

      const [url] = fetchSpy.mock.lastCall as [string];
      expect(url).toContain("published_after=");
    });

    it("handles null image_url", async () => {
      fetchSpy.mockResolvedValue(
        successResponse([
          {
            title: "No Image",
            description: "Desc",
            url: "https://example.com",
            image_url: null,
            source: "S",
            published_at: "2026-01-01",
          },
        ]),
      );

      const result = await adapter.fetchByCategory("devops", "DevOps");
      expect(result[0].imageUrl).toBeNull();
    });

    it("handles null description", async () => {
      fetchSpy.mockResolvedValue(
        successResponse([
          {
            title: "Article",
            description: null,
            url: "https://example.com",
            image_url: null,
            source: "S",
            published_at: "2026-01-01",
          },
        ]),
      );

      const result = await adapter.fetchByCategory("devops", "DevOps");
      expect(result[0].description).toBe("");
    });

    it("returns empty array when data is null", async () => {
      fetchSpy.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: null }),
        text: () => Promise.resolve(""),
      });

      const result = await adapter.fetchByCategory("devops", "DevOps");
      expect(result).toEqual([]);
    });

    it("returns empty array on HTTP error", async () => {
      fetchSpy.mockResolvedValue(errorResponse(500, "Server error"));

      const result = await adapter.fetchByCategory("devops", "DevOps");
      expect(result).toEqual([]);
    });

    it("returns empty array on network error", async () => {
      fetchSpy.mockRejectedValue(new Error("DNS failure"));

      const result = await adapter.fetchByCategory("devops", "DevOps");
      expect(result).toEqual([]);
    });

    it("uses custom baseUrl when provided", async () => {
      const customAdapter = new TheNewsApiAdapter({
        apiKey: "key",
        baseUrl: "https://custom.api.com/v1/news",
      });
      fetchSpy.mockResolvedValue(successResponse([]));

      await customAdapter.fetchByCategory("devops", "DevOps");

      const [url] = fetchSpy.mock.lastCall as [string];
      expect(url).toStartWith("https://custom.api.com/v1/news");
    });
  });
});

expect.extend({
  toStartWith(received: string, prefix: string) {
    return {
      pass: received.startsWith(prefix),
      message: () => `expected "${received}" to start with "${prefix}"`,
    };
  },
});

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toStartWith(prefix: string): R;
    }
  }
}
