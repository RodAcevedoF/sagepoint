import {
  Roadmap,
  RoadmapStep,
  IRoadmapRepository,
  IConceptRepository,
  IRoadmapGenerationService,
  IResourceDiscoveryService,
  IResourceRepository,
  Resource,
  UserContext,
} from '@sagepoint/domain';

export interface GenerateRoadmapCommand {
  documentId: string;
  title: string;
  userContext?: UserContext;
  discoverResources?: boolean; // defaults to true
}

export class GenerateRoadmapUseCase {
  constructor(
    private readonly roadmapRepository: IRoadmapRepository,
    private readonly conceptRepository: IConceptRepository,
    private readonly roadmapGenerationService: IRoadmapGenerationService,
    private readonly resourceDiscoveryService?: IResourceDiscoveryService,
    private readonly resourceRepository?: IResourceRepository
  ) {}

  async execute(command: GenerateRoadmapCommand): Promise<Roadmap> {
    const shouldDiscoverResources = command.discoverResources !== false;

    // 1. Fetch concepts and relationships from Neo4j
    const graph = await this.conceptRepository.getGraphByDocumentId(command.documentId);

    if (graph.nodes.length === 0) {
      // No concepts found - return empty roadmap
      const emptyRoadmap = new Roadmap({
        id: crypto.randomUUID(),
        title: command.title,
        documentId: command.documentId,
        description: 'No concepts found for this document. Please ensure the document has been processed.',
        steps: [],
        generationStatus: 'completed',
        createdAt: new Date(),
      });
      return this.roadmapRepository.save(emptyRoadmap);
    }

    // 2. Prepare concepts and relationships for the AI service
    const conceptsForOrdering = graph.nodes.map((concept) => ({
      id: concept.id,
      name: concept.name,
      description: concept.description,
    }));

    const relationshipsForOrdering = graph.edges.map((edge) => ({
      fromId: edge.from,
      toId: edge.to,
      type: edge.type as 'DEPENDS_ON' | 'RELATED_TO' | 'NEXT_STEP',
    }));

    // 3. Call AI service to generate learning path
    const learningPath = await this.roadmapGenerationService.generateLearningPath(
      conceptsForOrdering,
      relationshipsForOrdering,
      command.userContext
    );

    // 4. Build RoadmapSteps with AI-generated order and enrichments
    const conceptMap = new Map(graph.nodes.map((c) => [c.id, c]));

    const steps: RoadmapStep[] = [];
    for (const orderedConcept of learningPath.orderedConcepts) {
      const concept = conceptMap.get(orderedConcept.conceptId);
      if (!concept) continue;

      // Find dependencies based on graph edges
      const dependsOn = graph.edges
        .filter((e) => e.to === orderedConcept.conceptId && e.type === 'DEPENDS_ON')
        .map((e) => e.from);

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

    // 5. Create the roadmap (generate ID first for resource association)
    const roadmapId = crypto.randomUUID();
    const roadmap = new Roadmap({
      id: roadmapId,
      title: command.title,
      documentId: command.documentId,
      description: learningPath.description,
      steps,
      generationStatus: 'completed',
      totalEstimatedDuration: learningPath.totalEstimatedDuration,
      recommendedPace: learningPath.recommendedPace,
      createdAt: new Date(),
    });

    // 6. Save roadmap first
    const savedRoadmap = await this.roadmapRepository.save(roadmap);

    // 7. Discover and save resources for each concept (in parallel)
    if (shouldDiscoverResources && this.resourceDiscoveryService && this.resourceRepository) {
      await this.discoverAndSaveResources(roadmapId, steps);
    }

    return savedRoadmap;
  }

  private async discoverAndSaveResources(roadmapId: string, steps: RoadmapStep[]): Promise<void> {
    if (!this.resourceDiscoveryService || !this.resourceRepository) return;

    // Discover resources for all concepts in parallel
    const resourcePromises = steps.map(async (step, stepIndex) => {
      const discovered = await this.resourceDiscoveryService!.discoverResourcesForConcept(
        step.concept.name,
        step.concept.description,
        {
          maxResults: 3,
          difficulty: step.difficulty,
        }
      );

      // Convert discovered resources to domain entities
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
        })
      );
    });

    const resourceArrays = await Promise.all(resourcePromises);
    const allResources = resourceArrays.flat();

    // Save all resources in batch
    if (allResources.length > 0) {
      await this.resourceRepository.saveMany(allResources);
    }
  }
}
