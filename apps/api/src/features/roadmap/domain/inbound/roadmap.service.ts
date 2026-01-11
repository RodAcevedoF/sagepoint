import { Roadmap } from '@sagepoint/domain';

export const ROADMAP_SERVICE = Symbol('ROADMAP_SERVICE');

export interface GenerateRoadmapInput {
  documentId: string;
  title: string;
}

export interface IRoadmapService {
  generate(input: GenerateRoadmapInput): Promise<Roadmap>;
  findById(id: string): Promise<Roadmap | null>;
  findByDocumentId(documentId: string): Promise<Roadmap[]>;
  delete(id: string): Promise<void>;
}
