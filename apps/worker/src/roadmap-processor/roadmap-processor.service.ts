import { Processor, WorkerHost, InjectQueue } from "@nestjs/bullmq";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";
import { Job, Queue } from "bullmq";
import {
  RoadmapStep,
  Concept,
  TOPIC_CONCEPT_GENERATION_SERVICE,
  ROADMAP_GENERATION_SERVICE,
  CONCEPT_REPOSITORY,
  CONCEPT_EMBEDDING_REPOSITORY,
  ROADMAP_REPOSITORY,
  CATEGORY_REPOSITORY,
  TOKEN_BALANCE_REPOSITORY,
  OPERATION_COSTS,
  CATEGORY_CLASSIFIER_SERVICE,
  EMBEDDING_SERVICE,
  ROADMAP_RESOURCES_QUEUE,
  STEP_QUIZ_GENERATION_SERVICE,
  ROADMAP_STEP_QUESTION_REPOSITORY,
} from "@sagepoint/domain";
import type {
  IConceptRepository,
  IConceptEmbeddingRepository,
  IRoadmapRepository,
  ICategoryRepository,
  ITokenBalanceRepository,
  ITopicConceptGenerationService,
  IRoadmapGenerationService,
  IEmbeddingService,
  IRoadmapProcessorService,
  RoadmapGenerationInput,
  RoadmapGenerationProgress,
  ConceptForOrdering,
  ConceptRelationshipForOrdering,
  UserContext,
  ICategoryClassifierService,
  IStepQuizGenerationService,
  IRoadmapStepQuestionRepository,
  RoadmapStepQuestion,
} from "@sagepoint/domain";
import { applyQualityGate } from "./concept-quality-gate";
import { generateStepQuizzes } from "./step-quiz-generator";
import { Inject } from "@nestjs/common";
import { JobData } from "./contracts";

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
    @Inject(CONCEPT_REPOSITORY)
    private readonly conceptRepository: IConceptRepository,
    @Inject(ROADMAP_REPOSITORY)
    private readonly roadmapRepo: IRoadmapRepository,
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepo: ICategoryRepository,
    @Inject(TOKEN_BALANCE_REPOSITORY)
    private readonly tokenBalanceRepo: ITokenBalanceRepository,
    @Inject(CATEGORY_CLASSIFIER_SERVICE)
    private readonly categoryClassifier: ICategoryClassifierService,
    @InjectQueue(ROADMAP_RESOURCES_QUEUE)
    private readonly resourcesQueue: Queue,
    @Inject(EMBEDDING_SERVICE)
    private readonly embedder: IEmbeddingService,
    @Inject(CONCEPT_EMBEDDING_REPOSITORY)
    private readonly conceptEmbeddingRepo: IConceptEmbeddingRepository,
    @Inject(STEP_QUIZ_GENERATION_SERVICE)
    private readonly stepQuizService: IStepQuizGenerationService,
    @Inject(ROADMAP_STEP_QUESTION_REPOSITORY)
    private readonly stepQuizQuestionRepo: IRoadmapStepQuestionRepository,
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
      const parsedContext = userContext;

      const raw = await this.generateConcepts(
        roadmapId,
        topic,
        parsedContext,
        onProgress,
      );
      if (raw.concepts.length === 0) {
        await this.completeEmpty(roadmapId);
        return;
      }

      const gate = await applyQualityGate(
        { concepts: raw.concepts, relationships: raw.relationships },
        { embedder: this.embedder },
      );
      this.logger.info(
        { roadmapId, kept: gate.concepts.length, dropped: gate.dropped.length },
        "Quality gate applied",
      );
      if (gate.concepts.length < 3) {
        await this.completeEmpty(roadmapId);
        return;
      }

      const { concepts, relationships } = gate;
      await this.persistToNeo4j(roadmapId, concepts, relationships);
      await this.persistEmbeddings(roadmapId, gate.embeddings);

      const assembled = await this.assembleSteps(
        roadmapId,
        topic,
        concepts,
        relationships,
        parsedContext,
        onProgress,
      );

      onProgress?.({ stage: "step-quizzes" });
      const questions = await this.buildStepQuestions(
        roadmapId,
        assembled.steps,
      );

      await this.persistLearningPath(roadmapId, assembled);
      await this.persistStepQuestions(roadmapId, questions);

      await this.deductTokens((input as JobData).userId, roadmapId);

      await this.resourcesQueue.add(
        "discover-resources",
        { roadmapId },
        { jobId: roadmapId },
      );

      onProgress?.({ stage: "done" });
      this.logger.info(
        { roadmapId, stage: "done" },
        "Roadmap learning path complete, resources queued",
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

    await this.roadmapRepo.updateResources(roadmapId, {
      resourcesStatus: "completed",
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

  private async persistEmbeddings(
    roadmapId: string,
    embeddings: import("@sagepoint/domain").ConceptEmbedding[],
  ): Promise<void> {
    try {
      await this.conceptEmbeddingRepo.saveMany(embeddings);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.warn(
        { roadmapId, err },
        "Failed to persist concept embeddings",
      );
    }
  }

  private async assembleSteps(
    roadmapId: string,
    topic: string,
    concepts: ConceptForOrdering[],
    relationships: ConceptRelationshipForOrdering[],
    userContext?: UserContext,
    onProgress?: (progress: RoadmapGenerationProgress) => void,
  ): Promise<{
    steps: RoadmapStep[];
    description: string;
    recommendedPace?: string;
    categoryId?: string;
    totalEstimatedDuration?: number;
  }> {
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

    this.logger.info({ roadmapId, stepCount: steps.length }, "Steps assembled");

    return {
      steps,
      description: learningPath.description,
      recommendedPace: learningPath.recommendedPace ?? undefined,
      categoryId: categoryId ?? undefined,
      totalEstimatedDuration: stepDurationSum > 0 ? stepDurationSum : undefined,
    };
  }

  private async persistLearningPath(
    roadmapId: string,
    assembled: {
      steps: RoadmapStep[];
      description: string;
      recommendedPace?: string;
      categoryId?: string;
      totalEstimatedDuration?: number;
    },
  ): Promise<void> {
    await this.roadmapRepo.updateGeneration(roadmapId, {
      generationStatus: "completed",
      description: assembled.description,
      steps: assembled.steps,
      totalEstimatedDuration: assembled.totalEstimatedDuration,
      recommendedPace: assembled.recommendedPace,
      categoryId: assembled.categoryId,
    });

    this.logger.info(
      { roadmapId, stepCount: assembled.steps.length, stage: "completed" },
      "Roadmap generation complete",
    );
  }

  private async buildStepQuestions(
    roadmapId: string,
    steps: RoadmapStep[],
  ): Promise<RoadmapStepQuestion[]> {
    try {
      return await generateStepQuizzes(
        { roadmapId, steps },
        { service: this.stepQuizService },
      );
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.warn(
        { roadmapId, err },
        "Step quiz generation failed, skipping",
      );
      return [];
    }
  }

  private async persistStepQuestions(
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
        "Failed to persist step quiz questions",
      );
    }
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
    const categories = await this.categoryRepo.list();
    const categoryId = await this.categoryClassifier.classify({
      topic,
      conceptNames,
      candidates: categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description ?? undefined,
      })),
    });
    if (categoryId) {
      this.logger.info({ categoryId }, "Auto-assigned category (LLM)");
    } else {
      this.logger.info({ topic }, "No confident category match; leaving null");
    }
    return categoryId;
  }
}
