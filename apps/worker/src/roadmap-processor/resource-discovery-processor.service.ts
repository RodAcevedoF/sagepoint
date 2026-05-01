import { Processor, WorkerHost } from "@nestjs/bullmq";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";
import { Job } from "bullmq";
import {
  Resource,
  ROADMAP_REPOSITORY,
  RESOURCE_REPOSITORY,
  RESOURCE_DISCOVERY_SERVICE,
  ROADMAP_RESOURCES_QUEUE,
} from "@sagepoint/domain";
import type {
  IRoadmapRepository,
  IResourceRepository,
  IResourceDiscoveryService,
  RoadmapGenerationProgress,
} from "@sagepoint/domain";
import type {
  IResourceDiscoveryProcessorService,
  ResourceJobData,
} from "./contracts";
import { Inject } from "@nestjs/common";

@Processor(ROADMAP_RESOURCES_QUEUE)
export class ResourceDiscoveryProcessorService
  extends WorkerHost
  implements IResourceDiscoveryProcessorService
{
  constructor(
    @InjectPinoLogger(ResourceDiscoveryProcessorService.name)
    private readonly logger: PinoLogger,
    @Inject(ROADMAP_REPOSITORY)
    private readonly roadmapRepo: IRoadmapRepository,
    @Inject(RESOURCE_REPOSITORY)
    private readonly resourceRepo: IResourceRepository,
    @Inject(RESOURCE_DISCOVERY_SERVICE)
    private readonly resourceDiscovery: IResourceDiscoveryService,
  ) {
    super();
  }

  async process(job: Job<ResourceJobData>) {
    await this.discoverResources(job.data.roadmapId, (progress) => {
      void job.updateProgress(progress);
    });
  }

  async discoverResources(
    roadmapId: string,
    onProgress?: (progress: RoadmapGenerationProgress) => void,
  ): Promise<void> {
    this.logger.info(
      { roadmapId, stage: "resources" },
      "Starting resource discovery",
    );

    await this.roadmapRepo.updateResources(roadmapId, {
      resourcesStatus: "processing",
    });

    onProgress?.({ stage: "resources" });

    try {
      const roadmap = await this.roadmapRepo.findById(roadmapId);
      if (!roadmap) {
        this.logger.warn(
          { roadmapId },
          "Roadmap not found for resource discovery",
        );
        await this.roadmapRepo.updateResources(roadmapId, {
          resourcesStatus: "failed",
          resourcesErrorMessage: "Roadmap not found",
        });
        return;
      }

      const steps = roadmap.getOrderedSteps();
      const concepts = steps.map((step) => ({
        id: step.concept.id,
        name: step.concept.name,
        description: step.concept.description,
      }));

      const difficulty = steps[0]?.difficulty;
      const resourceMap =
        await this.resourceDiscovery.discoverResourcesForConcepts(concepts, {
          maxResults: 3,
          difficulty,
        });

      const allResources = steps.flatMap((step) => {
        const discovered = resourceMap.get(step.concept.id) ?? [];
        return discovered.map((d, idx) =>
          Resource.create({
            title: d.title,
            url: d.url,
            type: d.type,
            description: d.description,
            provider: d.provider,
            estimatedDuration: d.estimatedDuration,
            difficulty: d.difficulty,
            conceptId: step.concept.id,
            roadmapId,
            order: idx,
          }),
        );
      });

      if (allResources.length > 0) {
        await this.resourceRepo.saveMany(allResources);
      }

      await this.roadmapRepo.updateResources(roadmapId, {
        resourcesStatus: "completed",
      });

      this.logger.info(
        { roadmapId, resourceCount: allResources.length, stage: "done" },
        "Resource discovery complete",
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(
        { roadmapId, err: message },
        "Resource discovery failed",
      );
      await this.roadmapRepo.updateResources(roadmapId, {
        resourcesStatus: "failed",
        resourcesErrorMessage: message,
      });
      throw error;
    }
  }
}
