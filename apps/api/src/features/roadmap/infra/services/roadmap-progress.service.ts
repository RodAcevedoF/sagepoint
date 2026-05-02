import { Observable } from 'rxjs';
import { QueueEvents } from 'bullmq';
import type { IRoadmapService } from '@/features/roadmap/domain/inbound/roadmap.service';
import type {
  IRoadmapProgressService,
  SseProgressEvent,
} from '@/features/roadmap/domain/inbound/roadmap-progress.service';

export class RoadmapProgressServiceImpl implements IRoadmapProgressService {
  constructor(
    private readonly queueEvents: QueueEvents,
    private readonly resourcesQueueEvents: QueueEvents,
    private readonly roadmapService: IRoadmapService,
  ) {}

  streamProgress(roadmapId: string): Observable<SseProgressEvent> {
    return new Observable<SseProgressEvent>((subscriber) => {
      let done = false;

      const finish = () => {
        if (done) return;
        done = true;
        cleanup();
        subscriber.complete();
      };

      const onPhase1Progress = (args: { jobId: string; data: unknown }) => {
        if (args.jobId === roadmapId) {
          subscriber.next({
            data: JSON.stringify({
              type: 'progress',
              ...(args.data as Record<string, unknown>),
            }),
          });
        }
      };

      const onPhase1Completed = (args: { jobId: string }) => {
        if (args.jobId === roadmapId) {
          subscriber.next({
            data: JSON.stringify({
              type: 'partial-complete',
              stage: 'learning-path',
            }),
          });
        }
      };

      const onFailed = (args: { jobId: string; failedReason: string }) => {
        if (args.jobId === roadmapId) {
          subscriber.next({
            data: JSON.stringify({
              type: 'failed',
              message: args.failedReason,
            }),
          });
          finish();
        }
      };

      const onPhase2Progress = (args: { jobId: string; data: unknown }) => {
        if (args.jobId === roadmapId) {
          subscriber.next({
            data: JSON.stringify({
              type: 'progress',
              ...(args.data as Record<string, unknown>),
            }),
          });
        }
      };

      const onPhase2Completed = (args: { jobId: string }) => {
        if (args.jobId === roadmapId) {
          subscriber.next({
            data: JSON.stringify({ type: 'completed', stage: 'done' }),
          });
          finish();
        }
      };

      // 1. Subscribe to both queues FIRST (so nothing is missed)
      this.queueEvents.on('progress', onPhase1Progress);
      this.queueEvents.on('completed', onPhase1Completed);
      this.queueEvents.on('failed', onFailed);
      this.resourcesQueueEvents.on('progress', onPhase2Progress);
      this.resourcesQueueEvents.on('completed', onPhase2Completed);
      this.resourcesQueueEvents.on('failed', onFailed);

      const cleanup = () => {
        this.queueEvents.off('progress', onPhase1Progress);
        this.queueEvents.off('completed', onPhase1Completed);
        this.queueEvents.off('failed', onFailed);
        this.resourcesQueueEvents.off('progress', onPhase2Progress);
        this.resourcesQueueEvents.off('completed', onPhase2Completed);
        this.resourcesQueueEvents.off('failed', onFailed);
      };

      // 2. THEN check DB for already-terminal or mid-flight state
      this.roadmapService
        .findById(roadmapId)
        .then((roadmap) => {
          if (done) return;

          if (!roadmap) {
            subscriber.next({
              data: JSON.stringify({
                type: 'error',
                message: 'Roadmap not found',
              }),
            });
            finish();
            return;
          }

          if (roadmap.generationStatus === 'failed') {
            subscriber.next({
              data: JSON.stringify({
                type: 'failed',
                message: roadmap.errorMessage || 'Generation failed',
              }),
            });
            finish();
            return;
          }

          // Phase 1 done, phase 2 also done
          if (
            roadmap.generationStatus === 'completed' &&
            roadmap.resourcesStatus === 'completed'
          ) {
            subscriber.next({
              data: JSON.stringify({ type: 'completed', stage: 'done' }),
            });
            finish();
            return;
          }

          // Phase 1 done, phase 2 still running or failed
          if (roadmap.generationStatus === 'completed') {
            subscriber.next({
              data: JSON.stringify({
                type: 'partial-complete',
                stage: 'learning-path',
              }),
            });
            if (roadmap.resourcesStatus === 'failed') {
              subscriber.next({
                data: JSON.stringify({
                  type: 'failed',
                  message:
                    roadmap.resourcesErrorMessage ||
                    'Resource discovery failed',
                }),
              });
              finish();
            }
            return;
          }

          // Still in phase 1 — emit current status, keep stream open for live events
          subscriber.next({
            data: JSON.stringify({
              type: 'status',
              status: roadmap.generationStatus,
            }),
          });
        })
        .catch(() => {
          subscriber.next({
            data: JSON.stringify({
              type: 'error',
              message: 'Failed to check status',
            }),
          });
          finish();
        });

      return cleanup;
    });
  }
}
