import type { UserContext } from './roadmap-generation.port';

export interface SubConceptResult {
  name: string;
  description: string;
  order: number;
  estimatedDuration?: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  learningObjective: string;
}

export const CONCEPT_EXPANSION_SERVICE = Symbol('CONCEPT_EXPANSION_SERVICE');

export interface IConceptExpansionService {
  generateSubConcepts(
    parentName: string,
    parentDescription?: string,
    siblingConcepts?: string[],
    userContext?: UserContext,
  ): Promise<SubConceptResult[]>;
}
