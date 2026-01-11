import { Roadmap, Concept, IRoadmapRepository } from '@sagepoint/domain';

export class InMemoryRoadmapRepository implements IRoadmapRepository {
  private roadmaps: Map<string, Roadmap> = new Map();
  private concepts: Map<string, Concept> = new Map();
  private relations: Map<string, { toId: string; type: string }[]> = new Map();

  async save(roadmap: Roadmap): Promise<Roadmap> {
    this.roadmaps.set(roadmap.id, roadmap);
    return roadmap;
  }

  async findById(id: string): Promise<Roadmap | null> {
    return this.roadmaps.get(id) ?? null;
  }

  async findByDocumentId(documentId: string): Promise<Roadmap[]> {
    return Array.from(this.roadmaps.values()).filter(
      (r) => r.documentId === documentId,
    );
  }

  async delete(id: string): Promise<void> {
    this.roadmaps.delete(id);
  }

  async saveConcept(concept: Concept): Promise<Concept> {
    this.concepts.set(concept.id, concept);
    return concept;
  }

  async findConceptsByDocumentId(documentId: string): Promise<Concept[]> {
    return Array.from(this.concepts.values()).filter(
      (c) => c.documentId === documentId,
    );
  }

  async saveConceptRelation(
    fromConceptId: string,
    toConceptId: string,
    relationType: 'DEPENDS_ON' | 'NEXT_STEP',
  ): Promise<void> {
    const existing = this.relations.get(fromConceptId) ?? [];
    existing.push({ toId: toConceptId, type: relationType });
    this.relations.set(fromConceptId, existing);
  }
}
