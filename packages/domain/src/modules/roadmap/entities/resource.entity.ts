export enum ResourceType {
  ARTICLE = 'ARTICLE',
  VIDEO = 'VIDEO',
  COURSE = 'COURSE',
  DOCUMENTATION = 'DOCUMENTATION',
  TUTORIAL = 'TUTORIAL',
  BOOK = 'BOOK',
}

export interface ResourceProps {
  id: string;
  title: string;
  url: string;
  type: ResourceType;
  description?: string;
  provider?: string;
  estimatedDuration?: number; // in minutes
  difficulty?: string;
  conceptId: string;
  roadmapId: string;
  order: number;
  createdAt: Date;
}

export class Resource {
  readonly id: string;
  readonly title: string;
  readonly url: string;
  readonly type: ResourceType;
  readonly description?: string;
  readonly provider?: string;
  readonly estimatedDuration?: number;
  readonly difficulty?: string;
  readonly conceptId: string;
  readonly roadmapId: string;
  readonly order: number;
  readonly createdAt: Date;

  constructor(props: ResourceProps) {
    this.id = props.id;
    this.title = props.title;
    this.url = props.url;
    this.type = props.type;
    this.description = props.description;
    this.provider = props.provider;
    this.estimatedDuration = props.estimatedDuration;
    this.difficulty = props.difficulty;
    this.conceptId = props.conceptId;
    this.roadmapId = props.roadmapId;
    this.order = props.order;
    this.createdAt = props.createdAt;
  }

  static create(props: Omit<ResourceProps, 'id' | 'createdAt'>): Resource {
    return new Resource({
      ...props,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    });
  }
}
