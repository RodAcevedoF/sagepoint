import {
  Roadmap,
  RoadmapStep,
  Concept,
  IRoadmapRepository,
  IRoadmapGenerationService,
  ITopicConceptGenerationService,
  IResourceDiscoveryService,
  IResourceRepository,
  Resource,
  UserContext,
} from '@sagepoint/domain';

export interface GenerateTopicRoadmapCommand {
  topic: string;
  title?: string;
  userId?: string;
  userContext?: UserContext;
  discoverResources?: boolean;
}

export class GenerateTopicRoadmapUseCase {
  constructor(
    private readonly roadmapRepository: IRoadmapRepository,
    private readonly topicConceptGenerationService: ITopicConceptGenerationService,
    private readonly roadmapGenerationService: IRoadmapGenerationService,
    private readonly resourceDiscoveryService?: IResourceDiscoveryService,
    private readonly resourceRepository?: IResourceRepository,
  ) {}

  async execute(command: GenerateTopicRoadmapCommand): Promise<Roadmap> {
    const shouldDiscoverResources = command.discoverResources !== false;
    const title = command.title || `Learn ${command.topic}`;

    // 1. Generate concepts from topic via AI
    const { concepts, relationships } =
      await this.topicConceptGenerationService.generateConceptsFromTopic(
        command.topic,
        command.userContext,
      );

    if (concepts.length === 0) {
      const emptyRoadmap = new Roadmap({
        id: crypto.randomUUID(),
        title,
        userId: command.userId,
        description:
          'Could not generate concepts for this topic. Please try a more specific topic.',
        steps: [],
        generationStatus: 'completed',
        createdAt: new Date(),
      });
      return this.roadmapRepository.save(emptyRoadmap);
    }

    // 2. Generate learning path from concepts
    const learningPath =
      await this.roadmapGenerationService.generateLearningPath(
        concepts,
        relationships,
        command.userContext,
      );

    // 3. Build Concept entities and RoadmapSteps
    const conceptMap = new Map(concepts.map((c) => [c.id, c]));

    const steps: RoadmapStep[] = [];
    for (const orderedConcept of learningPath.orderedConcepts) {
      const conceptData = conceptMap.get(orderedConcept.conceptId);
      if (!conceptData) continue;

      const concept = new Concept(
        conceptData.id,
        conceptData.name,
        undefined, // no documentId for topic-based concepts
        conceptData.description,
      );

      const dependsOn = relationships
        .filter(
          (r) => r.toId === orderedConcept.conceptId && r.type === 'DEPENDS_ON',
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

    // 4. Create and save roadmap
    const roadmapId = crypto.randomUUID();
    // Compute total duration from individual step durations (more reliable than AI aggregate)
    const stepDurationSum = steps.reduce(
      (sum, s) => sum + (s.estimatedDuration ?? 0),
      0,
    );
    const roadmap = new Roadmap({
      id: roadmapId,
      title,
      userId: command.userId,
      description: learningPath.description,
      steps,
      generationStatus: 'completed',
      totalEstimatedDuration: stepDurationSum > 0 ? stepDurationSum : undefined,
      recommendedPace: learningPath.recommendedPace,
      createdAt: new Date(),
    });

    const savedRoadmap = await this.roadmapRepository.save(roadmap);

    // 5. Discover resources in parallel (fire-and-forget style)
    if (
      shouldDiscoverResources &&
      this.resourceDiscoveryService &&
      this.resourceRepository
    ) {
      await this.discoverAndSaveResources(roadmapId, steps);
    }

    return savedRoadmap;
  }

  private async discoverAndSaveResources(
    roadmapId: string,
    steps: RoadmapStep[],
  ): Promise<void> {
    if (!this.resourceDiscoveryService || !this.resourceRepository) return;

    const resourcePromises = steps.map(async (step) => {
      const discovered =
        await this.resourceDiscoveryService!.discoverResourcesForConcept(
          step.concept.name,
          step.concept.description,
          {
            maxResults: 3,
            difficulty: step.difficulty,
          },
        );

      return discovered.map((d, resourceIndex) =>
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
          order: resourceIndex,
        }),
      );
    });

    const resourceArrays = await Promise.all(resourcePromises);
    const allResources = resourceArrays.flat();

    if (allResources.length > 0) {
      await this.resourceRepository.saveMany(allResources);
    }
  }
}
