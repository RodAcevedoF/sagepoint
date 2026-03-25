import type {
  IQueueStatsProvider,
  QueueStats,
} from '../../domain/outbound/queue-stats.port';

export class GetQueueStatsUseCase {
  constructor(private readonly queueStatsProvider: IQueueStatsProvider) {}

  async execute(): Promise<{
    documentQueue: QueueStats;
    roadmapQueue: QueueStats;
  }> {
    const [documentQueue, roadmapQueue] = await Promise.all([
      this.queueStatsProvider.getDocumentQueueStats(),
      this.queueStatsProvider.getRoadmapQueueStats(),
    ]);

    return { documentQueue, roadmapQueue };
  }
}
