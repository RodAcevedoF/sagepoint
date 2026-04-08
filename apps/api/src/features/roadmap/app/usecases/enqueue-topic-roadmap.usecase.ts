import {
  Roadmap,
  IRoadmapRepository,
  IRoadmapGenerationQueue,
  IUserRepository,
  ResourceLimits,
  RoadmapLimitExceededError,
  UserRole,
  UserContext,
} from '@sagepoint/domain';
import type { IResourceLimitsRepository } from '@sagepoint/domain';

export interface EnqueueTopicRoadmapCommand {
  topic: string;
  title?: string;
  userId: string;
  userContext?: UserContext;
}

export class EnqueueTopicRoadmapUseCase {
  constructor(
    private readonly roadmapRepository: IRoadmapRepository,
    private readonly generationQueue: IRoadmapGenerationQueue,
    private readonly resourceLimitsRepository: IResourceLimitsRepository,
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(command: EnqueueTopicRoadmapCommand): Promise<Roadmap> {
    await this.enforceRoadmapLimit(command.userId);

    const title = command.title || `Learn ${command.topic}`;
    const roadmapId = crypto.randomUUID();

    // Save skeleton roadmap
    const skeleton = new Roadmap({
      id: roadmapId,
      title,
      userId: command.userId,
      description: `Generating roadmap for "${command.topic}"...`,
      steps: [],
      generationStatus: 'pending',
      createdAt: new Date(),
    });

    const saved = await this.roadmapRepository.save(skeleton);

    // Enqueue background job
    await this.generationQueue.add(
      roadmapId,
      command.topic,
      title,
      command.userId,
      command.userContext
        ? { experienceLevel: command.userContext.experienceLevel }
        : undefined,
    );

    return saved;
  }

  private async enforceRoadmapLimit(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user || user.role === UserRole.ADMIN) return;

    const limits =
      (await this.resourceLimitsRepository.findByUserId(userId)) ??
      ResourceLimits.defaults(userId);
    const currentCount = await this.roadmapRepository.countByUserId(userId);

    if (!limits.isRoadmapAllowed(currentCount)) {
      throw new RoadmapLimitExceededError(limits.maxRoadmaps!);
    }
  }
}
