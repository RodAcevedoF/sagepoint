import {
  Roadmap,
  IRoadmapRepository,
  IRoadmapGenerationQueue,
  IUserRepository,
  TokenBalance,
  InsufficientTokensError,
  UserRole,
  UserContext,
  OPERATION_COSTS,
} from '@sagepoint/domain';
import type { ITokenBalanceRepository } from '@sagepoint/domain';

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
    private readonly tokenBalanceRepository: ITokenBalanceRepository,
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(command: EnqueueTopicRoadmapCommand): Promise<Roadmap> {
    await this.enforceTokenBalance(command.userId);

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

  private async enforceTokenBalance(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user || user.role === UserRole.ADMIN) return;

    const balance =
      (await this.tokenBalanceRepository.findByUserId(userId)) ??
      TokenBalance.defaults(userId);
    if (!balance.canAfford(OPERATION_COSTS.TOPIC_ROADMAP)) {
      throw new InsufficientTokensError(
        OPERATION_COSTS.TOPIC_ROADMAP,
        balance.balance ?? 0,
      );
    }
  }
}
