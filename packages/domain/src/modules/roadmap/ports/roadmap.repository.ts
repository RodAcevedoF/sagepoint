import type { Roadmap } from '../entities/roadmap.entity';
import type { Concept } from '../entities/concept.entity';

export const ROADMAP_REPOSITORY = Symbol('ROADMAP_REPOSITORY');

export interface IRoadmapRepository {
  save(roadmap: Roadmap): Promise<Roadmap>;
  findById(id: string): Promise<Roadmap | null>;
  findByDocumentId(documentId: string): Promise<Roadmap[]>;
  findByUserId(userId: string): Promise<Roadmap[]>;
  delete(id: string): Promise<void>;

  saveConcept(concept: Concept): Promise<Concept>;
  findConceptsByDocumentId(documentId: string): Promise<Concept[]>;
  saveConceptRelation(
    fromConceptId: string,
    toConceptId: string,
    relationType: 'DEPENDS_ON' | 'NEXT_STEP',
  ): Promise<void>;
}
