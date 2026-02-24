import {
  Roadmap,
  Concept,
  StepStatus,
  Resource,
  UserContext,
} from '@sagepoint/domain';
import { UserRoadmapWithProgress } from '@/features/roadmap/app/usecases/get-user-roadmaps.usecase';
import { UpdateStepProgressResult } from '@/features/roadmap/app/usecases/update-step-progress.usecase';
import { RefreshResourcesResult } from '@/features/roadmap/app/usecases/refresh-resources.usecase';
import type { SuggestedTopic } from '@/features/roadmap/app/usecases/suggest-related-topics.usecase';
import type { GenerateStepQuizResult } from '@/features/roadmap/app/usecases/generate-step-quiz.usecase';
import type { SubmitStepQuizResult } from '@/features/roadmap/app/usecases/submit-step-quiz.usecase';

export const ROADMAP_SERVICE = Symbol('ROADMAP_SERVICE');

export interface GenerateRoadmapInput {
  documentId: string;
  title?: string;
  userId?: string;
  userContext?: UserContext;
}

export interface GenerateTopicRoadmapInput {
  topic: string;
  title?: string;
  userId?: string;
  userContext?: UserContext;
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

export interface ExpandConceptInput {
  roadmapId: string;
  conceptId: string;
  userContext?: UserContext;
}

export interface GenerateStepQuizInput {
  userId: string;
  roadmapId: string;
  conceptId: string;
}

export interface SubmitStepQuizInput {
  userId: string;
  attemptId: string;
  answers: Record<number, string>;
}

export interface IRoadmapService {
  // Existing methods
  generate(input: GenerateRoadmapInput): Promise<Roadmap>;
  generateFromTopic(input: GenerateTopicRoadmapInput): Promise<Roadmap>;
  findById(id: string): Promise<Roadmap | null>;
  findByDocumentId(documentId: string): Promise<Roadmap[]>;
  delete(id: string): Promise<void>;
  getGraph(documentId: string): Promise<{
    nodes: Concept[];
    edges: { from: string; to: string; type: string }[];
  }>;

  // Phase 3: Progress tracking
  updateStepProgress(
    input: UpdateProgressInput,
  ): Promise<UpdateStepProgressResult>;
  getUserRoadmaps(userId: string): Promise<UserRoadmapWithProgress[]>;
  getUserRoadmapById(
    userId: string,
    roadmapId: string,
  ): Promise<UserRoadmapWithProgress | null>;

  // Phase 3: Resource management
  refreshResources(
    input: RefreshResourcesInput,
  ): Promise<RefreshResourcesResult>;
  getResourcesByRoadmap(roadmapId: string): Promise<Resource[]>;

  // Concept expansion & suggestions
  expandConcept(input: ExpandConceptInput): Promise<Roadmap>;
  getSuggestions(roadmapId: string): Promise<SuggestedTopic[]>;

  // Step quiz
  generateStepQuiz(
    input: GenerateStepQuizInput,
  ): Promise<GenerateStepQuizResult>;
  submitStepQuiz(input: SubmitStepQuizInput): Promise<SubmitStepQuizResult>;
}
