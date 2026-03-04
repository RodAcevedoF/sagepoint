import { Injectable, Inject } from '@nestjs/common';
import type {
  IResourceDiscoveryService,
  ICacheService,
  DiscoveredResource,
  ResourceDiscoveryOptions,
} from '@sagepoint/domain';

const TTL_SECONDS = 604800; // 7 days

@Injectable()
export class CachedResourceDiscoveryAdapter implements IResourceDiscoveryService {
  constructor(
    @Inject('INNER_RESOURCE_DISCOVERY')
    private readonly inner: IResourceDiscoveryService,
    @Inject('WORKER_CACHE')
    private readonly cache: ICacheService,
  ) {}

  async discoverResourcesForConcept(
    conceptName: string,
    conceptDescription?: string,
    options?: ResourceDiscoveryOptions,
  ): Promise<DiscoveredResource[]> {
    const difficulty = options?.difficulty ?? 'intermediate';
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

  private normalize(name: string): string {
    return name.toLowerCase().replace(/\s+/g, '-');
  }
}
