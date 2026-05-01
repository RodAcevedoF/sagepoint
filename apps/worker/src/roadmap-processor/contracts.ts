import type {
  ConceptEmbedding,
  ConceptForOrdering,
  ConceptRelationshipForOrdering,
  IEmbeddingService,
  RoadmapGenerationProgress,
  UserContext,
} from "@sagepoint/domain";

export interface IResourceDiscoveryProcessorService {
  discoverResources(
    roadmapId: string,
    onProgress?: (progress: RoadmapGenerationProgress) => void,
  ): Promise<void>;
}

export interface JobData {
  roadmapId: string;
  topic: string;
  title: string;
  userId: string;
  userContext?: UserContext;
}

export interface ResourceJobData {
  roadmapId: string;
}

export interface QualityGateInput {
  concepts: ConceptForOrdering[];
  relationships: ConceptRelationshipForOrdering[];
}

export interface QualityGateResult {
  concepts: ConceptForOrdering[];
  relationships: ConceptRelationshipForOrdering[];
  embeddings: ConceptEmbedding[];
  dropped: Array<{
    id: string;
    reason: "name-dup" | "embedding-dup" | "disconnected";
  }>;
}

export interface QualityGateDeps {
  embedder: IEmbeddingService;
  similarityThreshold?: number;
}
