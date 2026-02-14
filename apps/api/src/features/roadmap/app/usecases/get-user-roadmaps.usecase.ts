import {
  IRoadmapRepository,
  IProgressRepository,
  IResourceRepository,
  Roadmap,
  RoadmapProgressSummary,
  StepStatus,
  Resource,
} from '@sagepoint/domain';

export interface UserRoadmapWithProgress {
  roadmap: Roadmap;
  progress: RoadmapProgressSummary;
  stepProgress: Record<string, StepStatus>;
  resources: Resource[];
}

export class GetUserRoadmapsUseCase {
  constructor(
    private readonly roadmapRepository: IRoadmapRepository,
    private readonly progressRepository: IProgressRepository,
    private readonly resourceRepository: IResourceRepository,
  ) {}

  async execute(userId: string): Promise<UserRoadmapWithProgress[]> {
    // Get all roadmaps for user
    const roadmaps = await this.roadmapRepository.findByUserId(userId);

    if (roadmaps.length === 0) {
      return [];
    }

    // Get progress summaries for all roadmaps in batch
    const progressSummaries =
      await this.progressRepository.getProgressSummariesForUser(userId);
    const progressMap = new Map(progressSummaries.map((p) => [p.roadmapId, p]));

    // Get resources for all roadmaps in parallel
    const resourcePromises = roadmaps.map((r) =>
      this.resourceRepository.findByRoadmapId(r.id),
    );
    const resourceArrays = await Promise.all(resourcePromises);

    // Combine results
    return roadmaps.map((roadmap, index) => {
      const progress = progressMap.get(roadmap.id) || {
        roadmapId: roadmap.id,
        totalSteps: roadmap.steps.length,
        completedSteps: 0,
        inProgressSteps: 0,
        skippedSteps: 0,
        progressPercentage: 0,
      };

      return {
        roadmap,
        progress,
        stepProgress: {},
        resources: resourceArrays[index],
      };
    });
  }

  async executeForRoadmap(
    userId: string,
    roadmapId: string,
  ): Promise<UserRoadmapWithProgress | null> {
    const roadmap = await this.roadmapRepository.findById(roadmapId);
    if (!roadmap) {
      return null;
    }

    const [progress, stepEntries, resources] = await Promise.all([
      this.progressRepository.getProgressSummary(userId, roadmapId),
      this.progressRepository.findByUserAndRoadmap(userId, roadmapId),
      this.resourceRepository.findByRoadmapId(roadmapId),
    ]);

    const stepProgress: Record<string, StepStatus> = {};
    for (const entry of stepEntries) {
      stepProgress[entry.conceptId] = entry.status;
    }

    return {
      roadmap,
      progress: progress || {
        roadmapId,
        totalSteps: roadmap.steps.length,
        completedSteps: 0,
        inProgressSteps: 0,
        skippedSteps: 0,
        progressPercentage: 0,
      },
      stepProgress,
      resources,
    };
  }
}
