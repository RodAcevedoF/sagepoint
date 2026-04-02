export const ROADMAP_PROCESSOR_SERVICE = Symbol("ROADMAP_PROCESSOR_SERVICE");

export interface RoadmapGenerationInput {
  roadmapId: string;
  topic: string;
  title: string;
  userId: string;
  userContext?: { experienceLevel?: string };
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
