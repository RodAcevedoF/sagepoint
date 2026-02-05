import { Roadmap, Concept, StepStatus, RoadmapProgressSummary, Resource } from '@sagepoint/domain';
import { UserRoadmapWithProgress } from '@/features/roadmap/app/usecases/get-user-roadmaps.usecase';
import { UpdateStepProgressResult } from '@/features/roadmap/app/usecases/update-step-progress.usecase';
import { RefreshResourcesResult } from '@/features/roadmap/app/usecases/refresh-resources.usecase';

export const ROADMAP_SERVICE = Symbol('ROADMAP_SERVICE');

export interface GenerateRoadmapInput {
  documentId: string;
  title: string;
  userId?: string;
}

export interface UpdateProgressInput {
  userId: string;
  roadmapId: string;
  conceptId: string;
  status: StepStatus;
}

export interface RefreshResourcesInput {
  roadmapId: string;
  conceptIds?: string[];
}

export interface IRoadmapService {
  // Existing methods
  generate(input: GenerateRoadmapInput): Promise<Roadmap>;
  findById(id: string): Promise<Roadmap | null>;
  findByDocumentId(documentId: string): Promise<Roadmap[]>;
  delete(id: string): Promise<void>;
  getGraph(documentId: string): Promise<{ nodes: Concept[]; edges: { from: string; to: string; type: string }[] }>;

  // Phase 3: Progress tracking
  updateStepProgress(input: UpdateProgressInput): Promise<UpdateStepProgressResult>;
  getUserRoadmaps(userId: string): Promise<UserRoadmapWithProgress[]>;
  getUserRoadmapById(userId: string, roadmapId: string): Promise<UserRoadmapWithProgress | null>;

  // Phase 3: Resource management
  refreshResources(input: RefreshResourcesInput): Promise<RefreshResourcesResult>;
  getResourcesByRoadmap(roadmapId: string): Promise<Resource[]>;
}
