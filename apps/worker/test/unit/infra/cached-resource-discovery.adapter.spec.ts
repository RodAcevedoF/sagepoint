import { CachedResourceDiscoveryAdapter } from "@sagepoint/ai";
import {
  FakeResourceDiscoveryService,
  FakeCacheService,
} from "../_fakes/services.fake";
import type { DiscoveredResource } from "@sagepoint/domain";

function buildAdapter(overrides?: {
  inner?: FakeResourceDiscoveryService;
  cache?: FakeCacheService;
}) {
  const inner = overrides?.inner ?? new FakeResourceDiscoveryService();
  const cache = overrides?.cache ?? new FakeCacheService();

  const adapter = Object.create(
    CachedResourceDiscoveryAdapter.prototype,
  ) as CachedResourceDiscoveryAdapter;
  Object.defineProperty(adapter, "inner", { value: inner });
  Object.defineProperty(adapter, "cache", { value: cache });

  return { adapter, inner, cache };
}

const SAMPLE_RESOURCES: DiscoveredResource[] = [
  {
    title: "Guide to ML",
    url: "https://example.com/ml",
    type: "ARTICLE" as never,
  },
  {
    title: "ML Video",
    url: "https://example.com/video",
    type: "VIDEO" as never,
  },
];

describe("CachedResourceDiscoveryAdapter", () => {
  describe("discoverResourcesForConcept", () => {
    it("should return resources from the inner service and cache them", async () => {
      const { adapter, inner, cache } = buildAdapter();
      inner.setResults(SAMPLE_RESOURCES);

      const result = await adapter.discoverResourcesForConcept(
        "Machine Learning",
        "ML basics",
      );

      expect(result).toHaveLength(2);
      expect(result[0].title).toBe("Guide to ML");

      // Should be cached now
      expect(cache.has("resources:machine-learning:intermediate")).toBe(true);
    });

    it("should return cached results without calling the inner service", async () => {
      const { adapter, inner, cache } = buildAdapter();
      cache.seed("resources:machine-learning:intermediate", SAMPLE_RESOURCES);

      // Inner service has different results — but they should NOT be used
      inner.setResults([
        {
          title: "Different",
          url: "https://other.com",
          type: "COURSE" as never,
        },
      ]);

      const result =
        await adapter.discoverResourcesForConcept("Machine Learning");

      expect(result).toHaveLength(2);
      expect(result[0].title).toBe("Guide to ML");
    });

    it("should normalize concept names for cache keys", async () => {
      const { adapter, inner, cache } = buildAdapter();
      inner.setResults(SAMPLE_RESOURCES);

      await adapter.discoverResourcesForConcept("Deep   Learning  Basics");

      expect(cache.has("resources:deep-learning-basics:intermediate")).toBe(
        true,
      );
    });

    it("should include difficulty in the cache key", async () => {
      const { adapter, inner, cache } = buildAdapter();
      inner.setResults(SAMPLE_RESOURCES);

      await adapter.discoverResourcesForConcept("ML", undefined, {
        difficulty: "beginner",
      });
      await adapter.discoverResourcesForConcept("ML", undefined, {
        difficulty: "advanced",
      });

      expect(cache.has("resources:ml:beginner")).toBe(true);
      expect(cache.has("resources:ml:advanced")).toBe(true);
    });

    it("should default to intermediate difficulty when not specified", async () => {
      const { adapter, inner, cache } = buildAdapter();
      inner.setResults(SAMPLE_RESOURCES);

      await adapter.discoverResourcesForConcept("ML");

      expect(cache.has("resources:ml:intermediate")).toBe(true);
    });
  });
});
