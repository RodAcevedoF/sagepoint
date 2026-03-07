import { Concept } from '../entities/concept.entity';

export const CONCEPT_REPOSITORY = Symbol('CONCEPT_REPOSITORY');

export interface ConceptGraph {
  nodes: Concept[];
  edges: { from: string; to: string; type: string }[];
}

export interface IConceptRepository {
  save(concept: Concept): Promise<void>;
  saveWithRelations(
    concepts: Concept[],
    relationships: { fromId: string; toId: string; type: string }[],
    sourceId?: string,
    sourceType?: 'Document' | 'Roadmap',
  ): Promise<void>;
  findById(id: string): Promise<Concept | null>;
  getGraphByDocumentId(documentId: string): Promise<ConceptGraph>;
  findRelatedConcepts(conceptNames: string[], limit?: number): Promise<ConceptGraph>;
  // Sub-concept operations
  addSubConceptRelation(parentId: string, childId: string): Promise<void>;
  // Related concept discovery
  findRelatedNotInSet(conceptIds: string[]): Promise<Concept[]>;
}
