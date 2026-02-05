import { ResourceType } from '../modules/roadmap/entities/resource.entity';

export interface ResourceDiscoveryOptions {
  maxResults?: number;
  preferredTypes?: ResourceType[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  freeOnly?: boolean;
}

export interface DiscoveredResource {
  title: string;
  url: string;
  type: ResourceType;
  description?: string;
  provider?: string;
  estimatedDuration?: number; // in minutes
  difficulty?: string;
}

export const RESOURCE_DISCOVERY_SERVICE = Symbol('RESOURCE_DISCOVERY_SERVICE');

export interface IResourceDiscoveryService {
  discoverResourcesForConcept(
    conceptName: string,
    conceptDescription?: string,
    options?: ResourceDiscoveryOptions
  ): Promise<DiscoveredResource[]>;
}
