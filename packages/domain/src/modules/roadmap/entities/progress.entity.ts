export enum StepStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  SKIPPED = 'SKIPPED',
}

export interface UserRoadmapProgressProps {
  userId: string;
  roadmapId: string;
  conceptId: string;
  status: StepStatus;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class UserRoadmapProgress {
  readonly userId: string;
  readonly roadmapId: string;
  readonly conceptId: string;
  readonly status: StepStatus;
  readonly completedAt?: Date;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: UserRoadmapProgressProps) {
    this.userId = props.userId;
    this.roadmapId = props.roadmapId;
    this.conceptId = props.conceptId;
    this.status = props.status;
    this.completedAt = props.completedAt;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(
    userId: string,
    roadmapId: string,
    conceptId: string,
    status: StepStatus = StepStatus.NOT_STARTED
  ): UserRoadmapProgress {
    const now = new Date();
    return new UserRoadmapProgress({
      userId,
      roadmapId,
      conceptId,
      status,
      completedAt: status === StepStatus.COMPLETED ? now : undefined,
      createdAt: now,
      updatedAt: now,
    });
  }

  withStatus(newStatus: StepStatus): UserRoadmapProgress {
    const now = new Date();
    return new UserRoadmapProgress({
      ...this,
      status: newStatus,
      completedAt: newStatus === StepStatus.COMPLETED ? now : this.completedAt,
      updatedAt: now,
    });
  }

  isCompleted(): boolean {
    return this.status === StepStatus.COMPLETED;
  }
}

// Aggregate for roadmap progress summary
export interface RoadmapProgressSummary {
  roadmapId: string;
  totalSteps: number;
  completedSteps: number;
  inProgressSteps: number;
  skippedSteps: number;
  progressPercentage: number;
}
