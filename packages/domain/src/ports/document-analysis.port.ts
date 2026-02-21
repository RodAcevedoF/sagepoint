export interface DocumentAnalysisResult {
  overview: string;
  keyPoints: string[];
  topicArea: string;
  difficulty: string;
}

export const DOCUMENT_ANALYSIS_SERVICE = Symbol('DOCUMENT_ANALYSIS_SERVICE');

export interface IDocumentAnalysisService {
  analyzeDocument(text: string): Promise<DocumentAnalysisResult>;
}
