
export interface ConceptForOrdering {
  id: string;
  name: string;
  description?: string;
}

export interface ConceptRelationshipForOrdering {
  fromId: string;
  toId: string;
  type: 'DEPENDS_ON' | 'RELATED_TO' | 'NEXT_STEP';
}

export interface UserContext {
  goal?: string;
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
  timeAvailable?: number; // hours per week
  preferredLearningStyle?: string;
}

export interface OrderedConcept {
  conceptId: string;
  order: number;
  learningObjective: string;
  estimatedDuration?: number; // in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  rationale: string; // why this concept is at this position
}

export interface GeneratedLearningPath {
  orderedConcepts: OrderedConcept[];
  description: string;
  totalEstimatedDuration?: number;
  recommendedPace?: string;
}

export const ROADMAP_GENERATION_SERVICE = Symbol('ROADMAP_GENERATION_SERVICE');

export interface IRoadmapGenerationService {
  generateLearningPath(
    concepts: ConceptForOrdering[],
    relationships: ConceptRelationshipForOrdering[],
    userContext?: UserContext
  ): Promise<GeneratedLearningPath>;
}

export const TOPIC_CONCEPT_GENERATION_SERVICE = Symbol('TOPIC_CONCEPT_GENERATION_SERVICE');

export interface ITopicConceptGenerationService {
  generateConceptsFromTopic(
    topic: string,
    userContext?: UserContext
  ): Promise<{
    concepts: ConceptForOrdering[];
    relationships: ConceptRelationshipForOrdering[];
  }>;
}
