import { GetGraphUseCase } from '@/features/roadmap/app/usecases/get-graph.usecase';
import { DeleteRoadmapUseCase } from '@/features/roadmap/app/usecases/delete-roadmap.usecase';
import { GenerateRoadmapUseCase } from '@/features/roadmap/app/usecases/generate-roadmap.usecase';
import { GenerateTopicRoadmapUseCase } from '@/features/roadmap/app/usecases/generate-topic-roadmap.usecase';
import { EnqueueTopicRoadmapUseCase } from '@/features/roadmap/app/usecases/enqueue-topic-roadmap.usecase';
import { GetRoadmapUseCase } from '@/features/roadmap/app/usecases/get-roadmap.usecase';
import {
  UpdateStepProgressUseCase,
  UpdateStepProgressResult,
} from '@/features/roadmap/app/usecases/update-step-progress.usecase';
import {
  RefreshResourcesUseCase,
  RefreshResourcesResult,
} from '@/features/roadmap/app/usecases/refresh-resources.usecase';
import {
  GetUserRoadmapsUseCase,
  UserRoadmapWithProgress,
} from '@/features/roadmap/app/usecases/get-user-roadmaps.usecase';
import { ExpandConceptUseCase } from '@/features/roadmap/app/usecases/expand-concept.usecase';
import {
  SuggestRelatedTopicsUseCase,
  SuggestedTopic,
} from '@/features/roadmap/app/usecases/suggest-related-topics.usecase';
import {
  GenerateStepQuizUseCase,
  GenerateStepQuizResult,
} from '@/features/roadmap/app/usecases/generate-step-quiz.usecase';
import {
  SubmitStepQuizUseCase,
  SubmitStepQuizResult,
} from '@/features/roadmap/app/usecases/submit-step-quiz.usecase';
import {
  Roadmap,
  Concept,
  Resource,
  IResourceRepository,
} from '@sagepoint/domain';
import {
  GenerateRoadmapInput,
  GenerateTopicRoadmapInput,
  UpdateProgressInput,
  RefreshResourcesInput,
  ExpandConceptInput,
  GenerateStepQuizInput,
  SubmitStepQuizInput,
  IRoadmapService,
} from '@/features/roadmap/domain/inbound/roadmap.service';

export class RoadmapService implements IRoadmapService {
  constructor(
    private readonly generateRoadmapUseCase: GenerateRoadmapUseCase,
    private readonly generateTopicRoadmapUseCase: GenerateTopicRoadmapUseCase,
    private readonly enqueueTopicRoadmapUseCase: EnqueueTopicRoadmapUseCase,
    private readonly getRoadmapUseCase: GetRoadmapUseCase,
    private readonly deleteRoadmapUseCase: DeleteRoadmapUseCase,
    private readonly getGraphUseCase: GetGraphUseCase,
    private readonly updateStepProgressUseCase: UpdateStepProgressUseCase,
    private readonly refreshResourcesUseCase: RefreshResourcesUseCase,
    private readonly getUserRoadmapsUseCase: GetUserRoadmapsUseCase,
    private readonly resourceRepository: IResourceRepository,
    private readonly expandConceptUseCase?: ExpandConceptUseCase,
    private readonly suggestRelatedTopicsUseCase?: SuggestRelatedTopicsUseCase,
    private readonly generateStepQuizUseCase?: GenerateStepQuizUseCase,
    private readonly submitStepQuizUseCase?: SubmitStepQuizUseCase,
  ) {}

  async getGraph(documentId: string): Promise<{
    nodes: Concept[];
    edges: { from: string; to: string; type: string }[];
  }> {
    return await this.getGraphUseCase.execute(documentId);
  }

  async generate(input: GenerateRoadmapInput): Promise<Roadmap> {
    return await this.generateRoadmapUseCase.execute(input);
  }

  async generateFromTopic(input: GenerateTopicRoadmapInput): Promise<Roadmap> {
    // Async: save skeleton + enqueue background job
    return await this.enqueueTopicRoadmapUseCase.execute({
      topic: input.topic,
      title: input.title,
      userId: input.userId!,
      userContext: input.userContext,
    });
  }

  async findById(id: string): Promise<Roadmap | null> {
    return await this.getRoadmapUseCase.execute(id);
  }

  async findByDocumentId(documentId: string): Promise<Roadmap[]> {
    return await this.getRoadmapUseCase.byDocumentId(documentId);
  }

  async delete(id: string): Promise<void> {
    return await this.deleteRoadmapUseCase.execute(id);
  }

  // Phase 3: Progress tracking
  async updateStepProgress(
    input: UpdateProgressInput,
  ): Promise<UpdateStepProgressResult> {
    return await this.updateStepProgressUseCase.execute(input);
  }

  async getUserRoadmaps(userId: string): Promise<UserRoadmapWithProgress[]> {
    return await this.getUserRoadmapsUseCase.execute(userId);
  }

  async getUserRoadmapById(
    userId: string,
    roadmapId: string,
  ): Promise<UserRoadmapWithProgress | null> {
    return await this.getUserRoadmapsUseCase.executeForRoadmap(
      userId,
      roadmapId,
    );
  }

  // Phase 3: Resource management
  async refreshResources(
    input: RefreshResourcesInput,
  ): Promise<RefreshResourcesResult> {
    return await this.refreshResourcesUseCase.execute(input);
  }

  async getResourcesByRoadmap(roadmapId: string): Promise<Resource[]> {
    return await this.resourceRepository.findByRoadmapId(roadmapId);
  }

  // Concept expansion & suggestions
  async expandConcept(input: ExpandConceptInput): Promise<Roadmap> {
    if (!this.expandConceptUseCase) {
      throw new Error('Concept expansion is not available');
    }
    return await this.expandConceptUseCase.execute(input);
  }

  async getSuggestions(roadmapId: string): Promise<SuggestedTopic[]> {
    if (!this.suggestRelatedTopicsUseCase) {
      return [];
    }
    return await this.suggestRelatedTopicsUseCase.execute(roadmapId);
  }

  // Step quiz
  async generateStepQuiz(
    input: GenerateStepQuizInput,
  ): Promise<GenerateStepQuizResult> {
    if (!this.generateStepQuizUseCase) {
      throw new Error('Step quiz generation is not available');
    }
    return await this.generateStepQuizUseCase.execute(input);
  }

  async submitStepQuiz(
    input: SubmitStepQuizInput,
  ): Promise<SubmitStepQuizResult> {
    if (!this.submitStepQuizUseCase) {
      throw new Error('Step quiz submission is not available');
    }
    return await this.submitStepQuizUseCase.execute(input);
  }
}
