import type { UserContext } from "./roadmap-generation.port";

export const ROADMAP_PROCESSOR_SERVICE = Symbol("ROADMAP_PROCESSOR_SERVICE");

export const ROADMAP_RESOURCES_QUEUE = "roadmap-resources";

export interface RoadmapGenerationInput {
  roadmapId: string;
  topic: string;
  title: string;
  userId: string;
  userContext?: UserContext;
}

export interface RoadmapGenerationProgress {
  stage: "concepts" | "learning-path" | "resources" | "done";
}

export interface IRoadmapProcessorService {
  generateRoadmap(
    input: RoadmapGenerationInput,
    onProgress?: (progress: RoadmapGenerationProgress) => void,
  ): Promise<void>;
}
