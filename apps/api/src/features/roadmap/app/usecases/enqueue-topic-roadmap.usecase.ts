import {
  Roadmap,
  IRoadmapRepository,
  IRoadmapGenerationQueue,
  IUserRepository,
  TokenBalance,
  InsufficientTokensError,
  UnsafeUserTextError,
  UserRole,
  UserContext,
  OPERATION_COSTS,
  validateUserText,
} from '@sagepoint/domain';
import type { ITokenBalanceRepository } from '@sagepoint/domain';
import { buildTopicRoadmapTitle } from './topic-roadmap-title';

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
    const validation = validateUserText(command.topic);
    if (!validation.ok) {
      throw new UnsafeUserTextError(validation.reason);
    }

    await this.enforceTokenBalance(command.userId);

    const topic = validation.value;
    const title = buildTopicRoadmapTitle(topic, command.title);
    const roadmapId = crypto.randomUUID();

    // Save skeleton roadmap
    const skeleton = new Roadmap({
      id: roadmapId,
      title,
      userId: command.userId,
      description: `Generating roadmap for "${topic}"...`,
      steps: [],
      generationStatus: 'pending',
      createdAt: new Date(),
    });

    const saved = await this.roadmapRepository.save(skeleton);

    // Enqueue background job
    await this.generationQueue.add(
      roadmapId,
      topic,
      title,
      command.userId,
      command.userContext,
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
