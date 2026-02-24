import { IRoadmapRepository, IConceptRepository } from '@sagepoint/domain';

export interface SuggestedTopic {
  concept: { id: string; name: string; description?: string };
  relevance: string;
}

export class SuggestRelatedTopicsUseCase {
  constructor(
    private readonly roadmapRepository: IRoadmapRepository,
    private readonly conceptRepository: IConceptRepository,
  ) {}

  async execute(roadmapId: string): Promise<SuggestedTopic[]> {
    const roadmap = await this.roadmapRepository.findById(roadmapId);
    if (!roadmap) {
      throw new Error(`Roadmap ${roadmapId} not found`);
    }

    const conceptIds = roadmap.steps.map((s) => s.concept.id);
    if (conceptIds.length === 0) return [];

    // Find related concepts via graph traversal that are NOT already in roadmap
    const relatedConcepts =
      await this.conceptRepository.findRelatedNotInSet(conceptIds);

    return relatedConcepts.map((c) => ({
      concept: { id: c.id, name: c.name, description: c.description },
      relevance: 'Related to concepts in your roadmap',
    }));
  }
}
