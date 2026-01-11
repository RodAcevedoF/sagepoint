import { Concept } from '../entities/concept.entity';

export const CONCEPT_REPOSITORY = Symbol('CONCEPT_REPOSITORY');

export interface IConceptRepository {
  save(concept: Concept): Promise<void>;
  findById(id: string): Promise<Concept | null>;
  searchByName(name: string): Promise<Concept[]>;
  // Graph operations
  addRelation(fromId: string, toId: string, type: 'DEPENDS_ON' | 'NEXT_STEP'): Promise<void>;
}
