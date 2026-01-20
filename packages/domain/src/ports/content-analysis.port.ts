export interface ConceptRelationship {
  targetName: string;
  type: 'DEPENDS_ON' | 'RELATED_TO' | 'NEXT_STEP';
}

export interface ExtractedConcept {
  name: string;
  description: string;
  relationships: ConceptRelationship[];
}

export interface IContentAnalysisService {
  extractConcepts(text: string): Promise<ExtractedConcept[]>;
}
