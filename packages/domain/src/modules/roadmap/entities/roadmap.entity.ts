import { Concept } from './concept.entity';

export interface RoadmapStep {
  concept: Concept;
  order: number;
  dependsOn: string[]; // concept IDs
  learningObjective?: string;
  estimatedDuration?: number; // in minutes
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  rationale?: string;
}

export type RoadmapGenerationStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface RoadmapProps {
  id: string;
  title: string;
  documentId?: string;
  userId?: string;
  categoryId?: string;
  description?: string;
  steps: RoadmapStep[];
  generationStatus?: RoadmapGenerationStatus;
  totalEstimatedDuration?: number; // in minutes
  recommendedPace?: string;
  createdAt: Date;
}

export class Roadmap {
  readonly id: string;
  readonly title: string;
  readonly documentId: string;
  readonly userId?: string;
  readonly categoryId?: string;
  readonly description?: string;
  readonly steps: RoadmapStep[];
  readonly generationStatus: RoadmapGenerationStatus;
  readonly totalEstimatedDuration?: number;
  readonly recommendedPace?: string;
  readonly createdAt: Date;

  constructor(props: RoadmapProps) {
    this.id = props.id;
    this.title = props.title;
    this.documentId = props.documentId;
    this.userId = props.userId;
    this.categoryId = props.categoryId;
    this.description = props.description;
    this.steps = props.steps;
    this.generationStatus = props.generationStatus || 'pending';
    this.totalEstimatedDuration = props.totalEstimatedDuration;
    this.recommendedPace = props.recommendedPace;
    this.createdAt = props.createdAt;
  }

  getOrderedSteps(): RoadmapStep[] {
    return [...this.steps].sort((a, b) => a.order - b.order);
  }

  getConceptById(conceptId: string): Concept | undefined {
    return this.steps.find((s) => s.concept.id === conceptId)?.concept;
  }
}
