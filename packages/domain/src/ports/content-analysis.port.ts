export interface ExtractedConcept {
  name: string;
  description: string;
}

export interface IContentAnalysisService {
  extractConcepts(text: string): Promise<ExtractedConcept[]>;
}
