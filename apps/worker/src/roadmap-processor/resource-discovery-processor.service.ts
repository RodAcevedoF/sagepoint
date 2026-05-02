import { Processor, WorkerHost } from "@nestjs/bullmq";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";
import { Job } from "bullmq";
import {
  Resource,
  ROADMAP_REPOSITORY,
  RESOURCE_REPOSITORY,
  RESOURCE_DISCOVERY_SERVICE,
  ROADMAP_RESOURCES_QUEUE,
  STEP_QUIZ_GENERATION_SERVICE,
  STEP_QUIZ_ENRICHMENT_SERVICE,
  ROADMAP_STEP_QUESTION_REPOSITORY,
} from "@sagepoint/domain";
import type {
  IRoadmapRepository,
  IResourceRepository,
  IResourceDiscoveryService,
  RoadmapGenerationProgress,
  IStepQuizGenerationService,
  IRoadmapStepQuestionRepository,
  RoadmapStep,
  RoadmapStepQuestion,
  DiscoveredResource,
} from "@sagepoint/domain";
import type {
  IResourceDiscoveryProcessorService,
  ResourceJobData,
} from "./contracts";
import { Inject } from "@nestjs/common";
import { generateStepQuizzes } from "./step-quiz-generator";
import { enrichStepQuizzes } from "./step-quiz-enricher";

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
    @Inject(STEP_QUIZ_GENERATION_SERVICE)
    private readonly stepQuizGenerationService: IStepQuizGenerationService,
    @Inject(STEP_QUIZ_ENRICHMENT_SERVICE)
    private readonly stepQuizEnrichmentService: IStepQuizGenerationService,
    @Inject(ROADMAP_STEP_QUESTION_REPOSITORY)
    private readonly stepQuizQuestionRepo: IRoadmapStepQuestionRepository,
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
      const difficulty = steps[0]?.difficulty;

      // Initial quiz generation runs concurrently with resource discovery.
      const questionsPromise = this.buildInitialQuizzes(roadmapId, steps);

      // Discover and save per batch of 4 so the frontend sees resources
      // appear progressively via polling rather than all at once at the end.
      const BATCH_SIZE = 4;
      const fullResourceMap = new Map<string, DiscoveredResource[]>();
      let totalSaved = 0;
      for (let i = 0; i < steps.length; i += BATCH_SIZE) {
        const batch = steps.slice(i, i + BATCH_SIZE);
        const batchResults = await Promise.all(
          batch.map((step) =>
            this.resourceDiscovery
              .discoverResourcesForConcept(
                step.concept.name,
                step.concept.description,
                { maxResults: 3, difficulty },
              )
              .then((resources) => ({ step, resources })),
          ),
        );

        const batchEntities = batchResults.flatMap(({ step, resources }) => {
          fullResourceMap.set(step.concept.id, resources);
          return resources.map((d, idx) =>
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

        if (batchEntities.length > 0) {
          await this.resourceRepo.saveMany(batchEntities);
          totalSaved += batchEntities.length;
        }
      }

      const questions = await questionsPromise;
      await this.persistInitialQuizzes(roadmapId, questions);

      const enriched = await this.buildEnrichedQuizzes(
        roadmapId,
        steps,
        fullResourceMap,
      );
      await this.persistEnrichedQuizzes(roadmapId, enriched);

      await this.roadmapRepo.updateResources(roadmapId, {
        resourcesStatus: "completed",
      });

      this.logger.info(
        { roadmapId, resourceCount: totalSaved, stage: "done" },
        "Resource discovery complete",
      );
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.warn({ roadmapId, err }, "Resource discovery failed");
      await this.roadmapRepo.updateResources(roadmapId, {
        resourcesStatus: "failed",
        resourcesErrorMessage: err.message,
      });
      throw error;
    }
  }

  private async buildInitialQuizzes(
    roadmapId: string,
    steps: RoadmapStep[],
  ): Promise<RoadmapStepQuestion[]> {
    try {
      return await generateStepQuizzes(
        { roadmapId, steps },
        { service: this.stepQuizGenerationService },
      );
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.warn(
        { roadmapId, err },
        "Phase-1 quiz generation failed; proceeding without initial questions",
      );
      return [];
    }
  }

  private async persistInitialQuizzes(
    roadmapId: string,
    questions: RoadmapStepQuestion[],
  ): Promise<void> {
    if (questions.length === 0) return;
    try {
      await this.stepQuizQuestionRepo.saveMany(questions);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.warn(
        { roadmapId, err },
        "Failed to persist initial quiz questions",
      );
    }
  }

  private async buildEnrichedQuizzes(
    roadmapId: string,
    steps: RoadmapStep[],
    resourceMap: Map<string, DiscoveredResource[]>,
  ): Promise<RoadmapStepQuestion[]> {
    try {
      return await enrichStepQuizzes(
        { roadmapId, steps, resourceMap },
        { service: this.stepQuizEnrichmentService },
      );
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.warn(
        { roadmapId, err },
        "Step quiz enrichment failed; keeping original questions",
      );
      return [];
    }
  }

  private async persistEnrichedQuizzes(
    roadmapId: string,
    questions: RoadmapStepQuestion[],
  ): Promise<void> {
    if (questions.length === 0) return;
    try {
      await this.stepQuizQuestionRepo.deleteByRoadmapId(roadmapId);
      await this.stepQuizQuestionRepo.saveMany(questions);
      this.logger.info(
        { roadmapId, questionCount: questions.length },
        "Step quiz enrichment complete",
      );
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.warn(
        { roadmapId, err },
        "Failed to persist enriched quiz questions",
      );
    }
  }
}
