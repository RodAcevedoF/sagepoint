import type {
  Roadmap,
  RoadmapGenerationStatus,
  RoadmapStep,
} from "../entities/roadmap.entity";
import { type RoadmapVisibility } from "../entities/roadmap.entity";
import type { Concept } from "../entities/concept.entity";

export const ROADMAP_REPOSITORY = Symbol("ROADMAP_REPOSITORY");

export interface RoadmapGenerationUpdate {
  generationStatus: RoadmapGenerationStatus;
  description?: string;
  steps?: RoadmapStep[];
  totalEstimatedDuration?: number;
  recommendedPace?: string;
  categoryId?: string;
  errorMessage?: string;
}

export interface IRoadmapRepository {
  save(roadmap: Roadmap): Promise<Roadmap>;
  findById(id: string): Promise<Roadmap | null>;
  findByDocumentId(documentId: string): Promise<Roadmap[]>;
  findByUserId(userId: string): Promise<Roadmap[]>;
  findPublic(): Promise<Roadmap[]>;
  updateVisibility(id: string, visibility: RoadmapVisibility): Promise<Roadmap>;
  updateGeneration(id: string, data: RoadmapGenerationUpdate): Promise<void>;
  delete(id: string): Promise<void>;

  searchPublic(query: string, limit?: number): Promise<Roadmap[]>;

  saveConcept(concept: Concept): Promise<Concept>;
  findConceptsByDocumentId(documentId: string): Promise<Concept[]>;
  saveConceptRelation(
    fromConceptId: string,
    toConceptId: string,
    relationType: "DEPENDS_ON" | "NEXT_STEP",
  ): Promise<void>;
  countByUserId(userId: string): Promise<number>;
}
