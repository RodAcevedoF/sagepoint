import { Observable } from 'rxjs';
import { QueueEvents } from 'bullmq';
import { DocumentStatus } from '@sagepoint/domain';
import type { IDocumentService } from '@/features/document/domain/inbound/document.service';
import type {
  IDocumentProgressService,
  SseProgressEvent,
} from '@/features/document/domain/inbound/document-progress.service';

export class DocumentProgressServiceImpl implements IDocumentProgressService {
  constructor(
    private readonly queueEvents: QueueEvents,
    private readonly documentService: IDocumentService,
  ) {}

  streamProgress(documentId: string): Observable<SseProgressEvent> {
    return new Observable<SseProgressEvent>((subscriber) => {
      let done = false;
      const enrichJobId = `${documentId}-enrich`;

      const finish = () => {
        if (done) return;
        done = true;
        cleanup();
        subscriber.complete();
      };

      const onProgress = (args: { jobId: string; data: unknown }) => {
        if (args.jobId === documentId || args.jobId === enrichJobId) {
          subscriber.next({
            data: JSON.stringify({
              type: 'progress',
              ...(args.data as Record<string, unknown>),
            }),
          });
        }
      };

      const onCompleted = (args: { jobId: string }) => {
        if (args.jobId === documentId) {
          // Job 1 done — summary ready, enrichment starting. Don't close stream.
          return;
        }
        if (args.jobId === enrichJobId) {
          subscriber.next({
            data: JSON.stringify({ type: 'completed' }),
          });
          finish();
        }
      };

      const onFailed = (args: { jobId: string; failedReason: string }) => {
        if (args.jobId === documentId) {
          subscriber.next({
            data: JSON.stringify({
              type: 'failed',
              message: args.failedReason,
            }),
          });
          finish();
        } else if (args.jobId === enrichJobId) {
          // Enrichment failed but summary is usable
          subscriber.next({
            data: JSON.stringify({ type: 'partial-complete' }),
          });
          finish();
        }
      };

      this.queueEvents.on('progress', onProgress);
      this.queueEvents.on('completed', onCompleted);
      this.queueEvents.on('failed', onFailed);

      const cleanup = () => {
        this.queueEvents.off('progress', onProgress);
        this.queueEvents.off('completed', onCompleted);
        this.queueEvents.off('failed', onFailed);
      };

      this.documentService
        .get(documentId)
        .then((document) => {
          if (done) return;

          if (!document) {
            subscriber.next({
              data: JSON.stringify({
                type: 'error',
                message: 'Document not found',
              }),
            });
            finish();
            return;
          }

          if (document.status === DocumentStatus.COMPLETED) {
            subscriber.next({
              data: JSON.stringify({ type: 'completed' }),
            });
            finish();
            return;
          }

          if (document.status === DocumentStatus.FAILED) {
            subscriber.next({
              data: JSON.stringify({
                type: 'failed',
                message: 'Processing failed',
              }),
            });
            finish();
            return;
          }

          subscriber.next({
            data: JSON.stringify({
              type: 'status',
              status: document.status,
              stage: document.processingStage?.toLowerCase(),
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
