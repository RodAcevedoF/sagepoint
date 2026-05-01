import type { RoadmapGenerationProgress } from "@sagepoint/domain";

export interface IResourceDiscoveryProcessorService {
  discoverResources(
    roadmapId: string,
    onProgress?: (progress: RoadmapGenerationProgress) => void,
  ): Promise<void>;
}
