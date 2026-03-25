import type { Queue } from 'bullmq';
import type {
  IQueueStatsProvider,
  QueueStats,
} from '../../domain/outbound/queue-stats.port';

export class BullMQQueueStatsProvider implements IQueueStatsProvider {
  constructor(
    private readonly documentQueue: Queue,
    private readonly roadmapQueue: Queue,
  ) {}

  async getDocumentQueueStats(): Promise<QueueStats> {
    return this.getStats(this.documentQueue);
  }

  async getRoadmapQueueStats(): Promise<QueueStats> {
    return this.getStats(this.roadmapQueue);
  }

  private async getStats(queue: Queue): Promise<QueueStats> {
    const [counts, failed] = await Promise.all([
      queue.getJobCounts(),
      queue.getFailed(0, 4),
    ]);

    return {
      name: queue.name,
      counts,
      recentFailures: failed.map((job) => ({
        id: job.id,
        name: job.name,
        failedReason: job.failedReason,
        timestamp: job.timestamp,
      })),
    };
  }
}
