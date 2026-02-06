import { GetGraphUseCase } from '@/features/roadmap/app/usecases/get-graph.usecase';
import { DeleteRoadmapUseCase } from '@/features/roadmap/app/usecases/delete-roadmap.usecase';
import { GenerateRoadmapUseCase } from '@/features/roadmap/app/usecases/generate-roadmap.usecase';
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
import {
  Roadmap,
  Concept,
  Resource,
  IResourceRepository,
} from '@sagepoint/domain';
import {
  GenerateRoadmapInput,
  UpdateProgressInput,
  RefreshResourcesInput,
  IRoadmapService,
} from '@/features/roadmap/domain/inbound/roadmap.service';

export class RoadmapService implements IRoadmapService {
  constructor(
    private readonly generateRoadmapUseCase: GenerateRoadmapUseCase,
    private readonly getRoadmapUseCase: GetRoadmapUseCase,
    private readonly deleteRoadmapUseCase: DeleteRoadmapUseCase,
    private readonly getGraphUseCase: GetGraphUseCase,
    private readonly updateStepProgressUseCase: UpdateStepProgressUseCase,
    private readonly refreshResourcesUseCase: RefreshResourcesUseCase,
    private readonly getUserRoadmapsUseCase: GetUserRoadmapsUseCase,
    private readonly resourceRepository: IResourceRepository,
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
}
