import type { IRoadmapGenerationQueue, UserContext } from '@sagepoint/domain';
import { Queue } from 'bullmq';

export class BullMqRoadmapGenerationQueue implements IRoadmapGenerationQueue {
  constructor(private readonly queue: Queue) {}

  async add(
    roadmapId: string,
    topic: string,
    title: string,
    userId: string,
    userContext?: UserContext,
  ): Promise<void> {
    await this.queue.add(
      'generate-roadmap',
      { roadmapId, topic, title, userId, userContext },
      { jobId: roadmapId },
    );
  }
}
