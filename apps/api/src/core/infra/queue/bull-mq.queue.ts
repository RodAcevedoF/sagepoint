import { IDocumentProcessingQueue } from '@sagepoint/domain';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

export class BullMqDocumentProcessingQueue implements IDocumentProcessingQueue {
  constructor(
    @InjectQueue('document-processing') private readonly queue: Queue,
  ) {}

  async add(
    documentId: string,
    storagePath: string,
    filename: string,
  ): Promise<void> {
    await this.queue.add('process-document', {
      documentId,
      storagePath,
      filename,
    });
  }
}
