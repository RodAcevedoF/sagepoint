import { Concept } from './concept.entity';

export interface RoadmapStep {
  concept: Concept;
  order: number;
  dependsOn: string[]; // concept IDs
}

export interface RoadmapProps {
  id: string;
  title: string;
  documentId: string;
  categoryId?: string;
  steps: RoadmapStep[];
  createdAt: Date;
}

export class Roadmap {
  readonly id: string;
  readonly title: string;
  readonly documentId: string;
  readonly categoryId?: string;
  readonly steps: RoadmapStep[];
  readonly createdAt: Date;

  constructor(props: RoadmapProps) {
    this.id = props.id;
    this.title = props.title;
    this.documentId = props.documentId;
    this.categoryId = props.categoryId;
    this.steps = props.steps;
    this.createdAt = props.createdAt;
  }

  getOrderedSteps(): RoadmapStep[] {
    return [...this.steps].sort((a, b) => a.order - b.order);
  }

  getConceptById(conceptId: string): Concept | undefined {
    return this.steps.find((s) => s.concept.id === conceptId)?.concept;
  }
}
