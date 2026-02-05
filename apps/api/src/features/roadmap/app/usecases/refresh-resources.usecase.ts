import {
  IRoadmapRepository,
  IResourceRepository,
  IResourceDiscoveryService,
  Resource,
  Roadmap,
} from '@sagepoint/domain';

export interface RefreshResourcesCommand {
  roadmapId: string;
  conceptIds?: string[]; // Optional: refresh only specific concepts
}

export interface RefreshResourcesResult {
  roadmapId: string;
  resourcesRefreshed: number;
  conceptsProcessed: number;
}

export class RefreshResourcesUseCase {
  constructor(
    private readonly roadmapRepository: IRoadmapRepository,
    private readonly resourceRepository: IResourceRepository,
    private readonly resourceDiscoveryService: IResourceDiscoveryService
  ) {}

  async execute(command: RefreshResourcesCommand): Promise<RefreshResourcesResult> {
    const roadmap = await this.roadmapRepository.findById(command.roadmapId);
    if (!roadmap) {
      throw new Error(`Roadmap ${command.roadmapId} not found`);
    }

    // Determine which concepts to refresh
    const stepsToRefresh = command.conceptIds
      ? roadmap.steps.filter((s) => command.conceptIds!.includes(s.concept.id))
      : roadmap.steps;

    if (stepsToRefresh.length === 0) {
      return {
        roadmapId: command.roadmapId,
        resourcesRefreshed: 0,
        conceptsProcessed: 0,
      };
    }

    // Delete existing resources for concepts being refreshed
    const conceptIdsToRefresh = stepsToRefresh.map((s) => s.concept.id);

    // Get existing resources and filter by concepts being refreshed
    const existingResources = await this.resourceRepository.findByRoadmapId(command.roadmapId);
    const resourcesToDelete = existingResources.filter((r) =>
      conceptIdsToRefresh.includes(r.conceptId)
    );

    // Delete old resources (in batch via roadmap if refreshing all, or individually)
    if (!command.conceptIds) {
      await this.resourceRepository.deleteByRoadmapId(command.roadmapId);
    }

    // Discover new resources in parallel
    const resourcePromises = stepsToRefresh.map(async (step) => {
      const discovered = await this.resourceDiscoveryService.discoverResourcesForConcept(
        step.concept.name,
        step.concept.description,
        {
          maxResults: 3,
          difficulty: step.difficulty,
        }
      );

      return discovered.map((d, index) =>
        Resource.create({
          title: d.title,
          url: d.url,
          type: d.type,
          description: d.description,
          provider: d.provider,
          estimatedDuration: d.estimatedDuration,
          difficulty: d.difficulty,
          conceptId: step.concept.id,
          roadmapId: command.roadmapId,
          order: index,
        })
      );
    });

    const resourceArrays = await Promise.all(resourcePromises);
    const allResources = resourceArrays.flat();

    // Save new resources in batch
    if (allResources.length > 0) {
      await this.resourceRepository.saveMany(allResources);
    }

    return {
      roadmapId: command.roadmapId,
      resourcesRefreshed: allResources.length,
      conceptsProcessed: stepsToRefresh.length,
    };
  }
}
