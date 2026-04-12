import { Processor, WorkerHost } from "@nestjs/bullmq";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";
import { Job } from "bullmq";
import {
  RoadmapStep,
  Concept,
  Resource,
  TOPIC_CONCEPT_GENERATION_SERVICE,
  ROADMAP_GENERATION_SERVICE,
  CONCEPT_REPOSITORY,
  ROADMAP_REPOSITORY,
  CATEGORY_REPOSITORY,
  RESOURCE_REPOSITORY,
  RESOURCE_DISCOVERY_SERVICE,
  TOKEN_BALANCE_REPOSITORY,
  OPERATION_COSTS,
} from "@sagepoint/domain";
import type {
  IConceptRepository,
  IRoadmapRepository,
  ICategoryRepository,
  IResourceRepository,
  ITokenBalanceRepository,
  ITopicConceptGenerationService,
  IRoadmapGenerationService,
  IResourceDiscoveryService,
  IRoadmapProcessorService,
  RoadmapGenerationInput,
  RoadmapGenerationProgress,
  ConceptForOrdering,
  ConceptRelationshipForOrdering,
  UserContext,
} from "@sagepoint/domain";
import { Inject } from "@nestjs/common";

interface JobData {
  roadmapId: string;
  topic: string;
  title: string;
  userId: string;
  userContext?: { experienceLevel?: string };
}

@Processor("roadmap-generation")
export class RoadmapProcessorService
  extends WorkerHost
  implements IRoadmapProcessorService
{
  constructor(
    @InjectPinoLogger(RoadmapProcessorService.name)
    private readonly logger: PinoLogger,
    @Inject(TOPIC_CONCEPT_GENERATION_SERVICE)
    private readonly topicConceptGenerator: ITopicConceptGenerationService,
    @Inject(ROADMAP_GENERATION_SERVICE)
    private readonly roadmapGenerator: IRoadmapGenerationService,
    @Inject(RESOURCE_DISCOVERY_SERVICE)
    private readonly resourceDiscovery: IResourceDiscoveryService,
    @Inject(CONCEPT_REPOSITORY)
    private readonly conceptRepository: IConceptRepository,
    @Inject(ROADMAP_REPOSITORY)
    private readonly roadmapRepo: IRoadmapRepository,
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepo: ICategoryRepository,
    @Inject(RESOURCE_REPOSITORY)
    private readonly resourceRepo: IResourceRepository,
    @Inject(TOKEN_BALANCE_REPOSITORY)
    private readonly tokenBalanceRepo: ITokenBalanceRepository,
  ) {
    super();
  }

  async process(job: Job<JobData>) {
    await this.generateRoadmap(job.data, (progress) => {
      void job.updateProgress(progress);
    });
  }

  async generateRoadmap(
    input: RoadmapGenerationInput,
    onProgress?: (progress: RoadmapGenerationProgress) => void,
  ): Promise<void> {
    const { roadmapId, topic, userContext } = input;
    this.logger.info(
      { roadmapId, topic, stage: "concepts" },
      "Processing roadmap generation",
    );

    try {
      await this.markProcessing(roadmapId);
      const parsedContext = this.parseUserContext(userContext);

      const { concepts, relationships } = await this.generateConcepts(
        roadmapId,
        topic,
        parsedContext,
        onProgress,
      );
      if (concepts.length === 0) {
        await this.completeEmpty(roadmapId);
        return;
      }

      await this.persistToNeo4j(roadmapId, concepts, relationships);

      const steps = await this.buildLearningPath(
        roadmapId,
        topic,
        concepts,
        relationships,
        parsedContext,
        onProgress,
      );

      await this.discoverAndSaveResources(roadmapId, steps, onProgress);
      await this.deductTokens((input as JobData).userId, roadmapId);

      onProgress?.({ stage: "done" });
      this.logger.info(
        { roadmapId, stage: "done" },
        "Roadmap resources discovered",
      );
    } catch (error) {
      await this.handleFailure(roadmapId, error);
      throw error;
    }
  }

  private async deductTokens(
    userId: string | undefined,
    roadmapId: string,
  ): Promise<void> {
    if (!userId) return;
    const deducted = await this.tokenBalanceRepo.atomicDeduct(
      userId,
      OPERATION_COSTS.TOPIC_ROADMAP,
    );
    if (!deducted) {
      this.logger.warn(
        { roadmapId, userId },
        "Token deduction failed after roadmap generation (race condition — overage accepted)",
      );
    }
  }

  private parseUserContext(raw?: {
    experienceLevel?: string;
  }): UserContext | undefined {
    if (!raw) return undefined;
    return {
      experienceLevel: raw.experienceLevel as UserContext["experienceLevel"],
    };
  }

  private async markProcessing(roadmapId: string): Promise<void> {
    await this.roadmapRepo.updateGeneration(roadmapId, {
      generationStatus: "processing",
    });
  }

  private async generateConcepts(
    roadmapId: string,
    topic: string,
    userContext?: UserContext,
    onProgress?: (progress: RoadmapGenerationProgress) => void,
  ): Promise<{
    concepts: ConceptForOrdering[];
    relationships: ConceptRelationshipForOrdering[];
  }> {
    onProgress?.({ stage: "concepts" });

    const ontologyContext = await this.fetchOntologyContext(roadmapId, topic);

    return this.topicConceptGenerator.generateConceptsFromTopic(
      topic,
      userContext,
      ontologyContext,
    );
  }

  private async fetchOntologyContext(
    roadmapId: string,
    topic: string,
  ): Promise<string | undefined> {
    const topicWords = topic.split(/\s+/).filter((w) => w.length > 2);
    try {
      const existingGraph =
        await this.conceptRepository.findRelatedConcepts(topicWords);
      if (existingGraph.nodes.length > 0) {
        this.logger.info(
          { roadmapId, existingConcepts: existingGraph.nodes.length },
          "Found existing ontology context",
        );
        return existingGraph.nodes
          .map((c) => `${c.name}: ${c.description || ""}`)
          .join("\n");
      }
    } catch (error) {
      this.logger.warn(
        {
          roadmapId,
          err: error instanceof Error ? error.message : String(error),
        },
        "Failed to query existing ontology, proceeding without",
      );
    }
    return undefined;
  }

  private async completeEmpty(roadmapId: string): Promise<void> {
    await this.roadmapRepo.updateGeneration(roadmapId, {
      generationStatus: "completed",
      description:
        "Could not generate concepts for this topic. Please try a more specific topic.",
    });
  }

  private async persistToNeo4j(
    roadmapId: string,
    concepts: ConceptForOrdering[],
    relationships: ConceptRelationshipForOrdering[],
  ): Promise<void> {
    const conceptEntities = concepts.map((c) =>
      Concept.create(c.id, c.name, undefined, c.description),
    );
    try {
      await this.conceptRepository.saveWithRelations(
        conceptEntities,
        relationships,
        roadmapId,
        "Roadmap",
      );
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.warn(
        { roadmapId, err },
        "Failed to persist concepts to Neo4j",
      );
    }
  }

  private async buildLearningPath(
    roadmapId: string,
    topic: string,
    concepts: ConceptForOrdering[],
    relationships: ConceptRelationshipForOrdering[],
    userContext?: UserContext,
    onProgress?: (progress: RoadmapGenerationProgress) => void,
  ): Promise<RoadmapStep[]> {
    onProgress?.({ stage: "learning-path" });

    const learningPath = await this.roadmapGenerator.generateLearningPath(
      concepts,
      relationships,
      userContext,
    );

    const conceptMap = new Map(concepts.map((c) => [c.id, c]));
    const steps: RoadmapStep[] = [];

    for (const orderedConcept of learningPath.orderedConcepts) {
      const conceptData = conceptMap.get(orderedConcept.conceptId);
      if (!conceptData) continue;

      const concept = new Concept(
        conceptData.id,
        conceptData.name,
        undefined,
        conceptData.description,
      );

      const dependsOn = relationships
        .filter(
          (r) => r.toId === orderedConcept.conceptId && r.type === "DEPENDS_ON",
        )
        .map((r) => r.fromId);

      steps.push({
        concept,
        order: orderedConcept.order,
        dependsOn,
        learningObjective: orderedConcept.learningObjective,
        estimatedDuration: orderedConcept.estimatedDuration,
        difficulty: orderedConcept.difficulty,
        rationale: orderedConcept.rationale,
      });
    }

    const stepDurationSum = steps.reduce(
      (sum, s) => sum + (s.estimatedDuration ?? 0),
      0,
    );
    const categoryId = await this.matchCategory(
      topic,
      concepts.map((c) => c.name),
    );

    await this.roadmapRepo.updateGeneration(roadmapId, {
      generationStatus: "completed",
      description: learningPath.description,
      steps,
      totalEstimatedDuration: stepDurationSum > 0 ? stepDurationSum : undefined,
      recommendedPace: learningPath.recommendedPace ?? undefined,
      categoryId: categoryId ?? undefined,
    });

    this.logger.info(
      { roadmapId, stepCount: steps.length, stage: "completed" },
      "Roadmap generation complete",
    );

    return steps;
  }

  private async handleFailure(
    roadmapId: string,
    error: unknown,
  ): Promise<void> {
    const err = error instanceof Error ? error : new Error(String(error));
    this.logger.error({ roadmapId, err }, "Roadmap generation failed");
    await this.roadmapRepo.updateGeneration(roadmapId, {
      generationStatus: "failed",
      errorMessage: error instanceof Error ? error.message : "Unknown error",
    });
  }

  private async matchCategory(
    topic: string,
    conceptNames: string[],
  ): Promise<string | null> {
    try {
      const categories = await this.categoryRepo.list();

      const searchText = [topic, ...conceptNames].join(" ").toLowerCase();
      let bestMatch: { id: string; score: number } | null = null;

      for (const cat of categories) {
        const keywords = [
          cat.name.toLowerCase(),
          cat.slug.replace(/-/g, " "),
          ...(cat.description?.toLowerCase().split(/[,\s]+/) ?? []),
        ].filter((k) => k.length > 2);

        const score = keywords.reduce(
          (sum, kw) => sum + (searchText.includes(kw) ? 1 : 0),
          0,
        );

        if (score > 0 && (!bestMatch || score > bestMatch.score)) {
          bestMatch = { id: cat.id, score };
        }
      }

      if (bestMatch) {
        this.logger.info(
          { categoryId: bestMatch.id, score: bestMatch.score },
          "Auto-assigned category",
        );
      }
      return bestMatch?.id ?? null;
    } catch {
      return null;
    }
  }

  private async discoverAndSaveResources(
    roadmapId: string,
    steps: RoadmapStep[],
    onProgress?: (progress: RoadmapGenerationProgress) => void,
  ): Promise<void> {
    onProgress?.({ stage: "resources" });

    try {
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

      this.logger.info(
        { roadmapId, resourceCount: allResources.length },
        "Saved resources for roadmap",
      );
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.warn(
        { roadmapId, err },
        "Resource discovery failed for roadmap",
      );
    }
  }
}
