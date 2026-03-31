import type {
  IResourceDiscoveryService,
  ICacheService,
  DiscoveredResource,
  ResourceDiscoveryOptions,
  ConceptForDiscovery,
} from "@sagepoint/domain";

const TTL_SECONDS = 604800; // 7 days

export class CachedResourceDiscoveryAdapter implements IResourceDiscoveryService {
  constructor(
    private readonly inner: IResourceDiscoveryService,
    private readonly cache: ICacheService,
  ) {}

  async discoverResourcesForConcept(
    conceptName: string,
    conceptDescription?: string,
    options?: ResourceDiscoveryOptions,
  ): Promise<DiscoveredResource[]> {
    const difficulty = options?.difficulty ?? "intermediate";
    const key = `resources:${this.normalize(conceptName)}:${difficulty}`;

    const cached = await this.cache.get<DiscoveredResource[]>(key);
    if (cached) return cached;

    const resources = await this.inner.discoverResourcesForConcept(
      conceptName,
      conceptDescription,
      options,
    );

    await this.cache.set(key, resources, TTL_SECONDS);

    return resources;
  }

  async discoverResourcesForConcepts(
    concepts: ConceptForDiscovery[],
    options?: ResourceDiscoveryOptions,
  ): Promise<Map<string, DiscoveredResource[]>> {
    const result = new Map<string, DiscoveredResource[]>();
    const difficulty = options?.difficulty ?? "intermediate";
    const uncached: ConceptForDiscovery[] = [];

    // Check cache for each concept
    for (const concept of concepts) {
      const key = `resources:${this.normalize(concept.name)}:${difficulty}`;
      const cached = await this.cache.get<DiscoveredResource[]>(key);
      if (cached) {
        result.set(concept.id, cached);
      } else {
        uncached.push(concept);
      }
    }

    if (uncached.length === 0) return result;

    // Batch-discover cache misses
    const discovered = await this.inner.discoverResourcesForConcepts(
      uncached,
      options,
    );

    // Cache and merge results
    for (const [conceptId, resources] of discovered) {
      const concept = uncached.find((c) => c.id === conceptId);
      if (concept) {
        const key = `resources:${this.normalize(concept.name)}:${difficulty}`;
        await this.cache.set(key, resources, TTL_SECONDS);
      }
      result.set(conceptId, resources);
    }

    return result;
  }

  private normalize(name: string): string {
    return name.toLowerCase().replace(/\s+/g, "-");
  }
}
