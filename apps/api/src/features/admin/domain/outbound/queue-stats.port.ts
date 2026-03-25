export const QUEUE_STATS_PROVIDER = Symbol('QUEUE_STATS_PROVIDER');

export interface QueueFailure {
  id: string | undefined;
  name: string;
  failedReason: string | undefined;
  timestamp: number;
}

export interface QueueStats {
  name: string;
  counts: Record<string, number>;
  recentFailures: QueueFailure[];
}

export interface IQueueStatsProvider {
  getDocumentQueueStats(): Promise<QueueStats>;
  getRoadmapQueueStats(): Promise<QueueStats>;
}
