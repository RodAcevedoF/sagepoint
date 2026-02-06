import {
  IProgressRepository,
  IRoadmapRepository,
  UserRoadmapProgress,
  StepStatus,
  RoadmapProgressSummary,
} from '@sagepoint/domain';

export interface UpdateStepProgressCommand {
  userId: string;
  roadmapId: string;
  conceptId: string;
  status: StepStatus;
}

export interface UpdateStepProgressResult {
  progress: UserRoadmapProgress;
  summary: RoadmapProgressSummary;
}

export class UpdateStepProgressUseCase {
  constructor(
    private readonly progressRepository: IProgressRepository,
    private readonly roadmapRepository: IRoadmapRepository,
  ) {}

  async execute(
    command: UpdateStepProgressCommand,
  ): Promise<UpdateStepProgressResult> {
    // Verify roadmap exists and belongs to user
    const roadmap = await this.roadmapRepository.findById(command.roadmapId);
    if (!roadmap) {
      throw new Error(`Roadmap ${command.roadmapId} not found`);
    }

    // Verify concept exists in roadmap
    const conceptExists = roadmap.steps.some(
      (s) => s.concept.id === command.conceptId,
    );
    if (!conceptExists) {
      throw new Error(
        `Concept ${command.conceptId} not found in roadmap ${command.roadmapId}`,
      );
    }

    // Create or update progress
    const progress = UserRoadmapProgress.create(
      command.userId,
      command.roadmapId,
      command.conceptId,
      command.status,
    );

    const savedProgress = await this.progressRepository.upsert(progress);

    // Get updated summary
    const summary = await this.progressRepository.getProgressSummary(
      command.userId,
      command.roadmapId,
    );

    return {
      progress: savedProgress,
      summary: summary!,
    };
  }
}
