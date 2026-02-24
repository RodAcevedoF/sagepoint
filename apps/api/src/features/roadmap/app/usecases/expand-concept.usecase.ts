import {
  Roadmap,
  RoadmapStep,
  IRoadmapRepository,
  IConceptRepository,
  IConceptExpansionService,
  IResourceDiscoveryService,
  IResourceRepository,
  Concept,
  Resource,
  UserContext,
} from '@sagepoint/domain';

export interface ExpandConceptCommand {
  roadmapId: string;
  conceptId: string;
  userContext?: UserContext;
}

export class ExpandConceptUseCase {
  constructor(
    private readonly roadmapRepository: IRoadmapRepository,
    private readonly conceptRepository: IConceptRepository,
    private readonly conceptExpansionService: IConceptExpansionService,
    private readonly resourceDiscoveryService?: IResourceDiscoveryService,
    private readonly resourceRepository?: IResourceRepository,
  ) {}

  async execute(command: ExpandConceptCommand): Promise<Roadmap> {
    // 1. Fetch roadmap
    const roadmap = await this.roadmapRepository.findById(command.roadmapId);
    if (!roadmap) {
      throw new Error(`Roadmap ${command.roadmapId} not found`);
    }

    // 2. Find parent step
    const parentStep = roadmap.steps.find(
      (s) => s.concept.id === command.conceptId,
    );
    if (!parentStep) {
      throw new Error(
        `Concept ${command.conceptId} not found in roadmap ${command.roadmapId}`,
      );
    }

    // 3. Fetch concept from Neo4j for full data
    const parentConcept = await this.conceptRepository.findById(
      command.conceptId,
    );

    // 4. Get sibling concept names for context
    const siblingConcepts = roadmap.steps
      .filter((s) => s.concept.id !== command.conceptId)
      .map((s) => s.concept.name);

    // 5. Generate sub-concepts via AI
    if (!this.conceptExpansionService) {
      throw new Error('Concept expansion service is required');
    }
    const subConcepts = await this.conceptExpansionService.generateSubConcepts(
      parentConcept?.name ?? parentStep.concept.name,
      parentConcept?.description ?? parentStep.concept.description,
      siblingConcepts,
      command.userContext,
    );

    // 6. Save sub-concepts to Neo4j and create HAS_SUBCONCEPT relationships
    const newSteps: RoadmapStep[] = [];
    for (const sub of subConcepts) {
      const conceptId = crypto.randomUUID();
      const concept = Concept.create(
        conceptId,
        sub.name,
        parentConcept?.documentId,
        sub.description,
      );

      await this.conceptRepository.save(concept);
      await this.conceptRepository.addSubConceptRelation(
        command.conceptId,
        conceptId,
      );

      newSteps.push({
        concept,
        order: 0, // will be re-ordered below
        dependsOn: [command.conceptId],
        learningObjective: sub.learningObjective,
        estimatedDuration: sub.estimatedDuration,
        difficulty: sub.difficulty,
        rationale: `Sub-concept of "${parentStep.concept.name}"`,
      });
    }

    // 7. Re-order steps: insert new steps after parent
    const existingSteps = [...roadmap.steps].sort((a, b) => a.order - b.order);
    const parentIndex = existingSteps.findIndex(
      (s) => s.concept.id === command.conceptId,
    );

    const before = existingSteps.slice(0, parentIndex + 1);
    const after = existingSteps.slice(parentIndex + 1);

    const allSteps = [...before, ...newSteps, ...after].map((step, i) => ({
      ...step,
      order: i + 1,
    }));

    // 8. Save updated roadmap
    const updatedRoadmap = new Roadmap({
      ...roadmap,
      steps: allSteps,
      documentId: roadmap.documentId,
    });
    const saved = await this.roadmapRepository.save(updatedRoadmap);

    // 9. Discover resources for new steps (fire-and-forget)
    if (this.resourceDiscoveryService && this.resourceRepository) {
      this.discoverResourcesForSteps(command.roadmapId, newSteps).catch(
        () => {},
      );
    }

    return saved;
  }

  private async discoverResourcesForSteps(
    roadmapId: string,
    steps: RoadmapStep[],
  ): Promise<void> {
    if (!this.resourceDiscoveryService || !this.resourceRepository) return;

    const resourcePromises = steps.map(async (step) => {
      const discovered =
        await this.resourceDiscoveryService!.discoverResourcesForConcept(
          step.concept.name,
          step.concept.description,
          { maxResults: 3, difficulty: step.difficulty },
        );

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

    const resourceArrays = await Promise.all(resourcePromises);
    const allResources = resourceArrays.flat();
    if (allResources.length > 0) {
      await this.resourceRepository.saveMany(allResources);
    }
  }
}
