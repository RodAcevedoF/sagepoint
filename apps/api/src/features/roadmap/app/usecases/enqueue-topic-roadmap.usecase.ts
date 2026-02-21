import {
  Roadmap,
  IRoadmapRepository,
  IRoadmapGenerationQueue,
  UserContext,
} from '@sagepoint/domain';

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
  ) {}

  async execute(command: EnqueueTopicRoadmapCommand): Promise<Roadmap> {
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
}
