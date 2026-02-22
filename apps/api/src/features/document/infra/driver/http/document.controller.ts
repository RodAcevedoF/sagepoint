import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Inject,
  NotFoundException,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
  Sse,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { QueueEvents } from 'bullmq';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  DOCUMENT_SERVICE,
  type IDocumentService,
} from '@/features/document/domain/inbound/document.service';
import type { Express } from 'express';
import { DocumentStatus } from '@sagepoint/domain';
import { CurrentUser } from '@/features/auth/decorators/current-user.decorator';
import type { RequestUser } from '@/features/auth/domain/request-user';
import { JwtAuthGuard } from '@/features/auth/infra/guards/jwt-auth.guard';

interface SseEvent {
  data: string;
}

@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentController {
  constructor(
    @Inject(DOCUMENT_SERVICE)
    private readonly documentService: IDocumentService,
    @Inject('DOCUMENT_QUEUE_EVENTS')
    private readonly queueEvents: QueueEvents,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: RequestUser,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    return await this.documentService.upload({
      filename: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      fileBuffer: file.buffer,
      userId: user.id,
    });
  }

  @Get()
  async list() {
    return await this.documentService.list();
  }

  @Get('user/me')
  async getUserDocuments(@CurrentUser() user: RequestUser) {
    return await this.documentService.getUserDocuments(user.id);
  }

  @Sse(':id/events')
  events(@Param('id') documentId: string): Observable<SseEvent> {
    return new Observable<SseEvent>((subscriber) => {
      let done = false;

      const finish = () => {
        if (done) return;
        done = true;
        cleanup();
        subscriber.complete();
      };

      const onProgress = (args: { jobId: string; data: unknown }) => {
        if (args.jobId === documentId) {
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

  @Get(':id')
  async get(@Param('id') id: string) {
    const document = await this.documentService.get(id);
    if (!document) {
      throw new NotFoundException(`Document ${id} not found`);
    }
    return document;
  }

  @Get(':id/summary')
  async getSummary(@Param('id') id: string) {
    return await this.documentService.getSummary(id);
  }

  @Get(':id/quizzes')
  async getQuizzes(@Param('id') id: string) {
    return await this.documentService.getQuizzes(id);
  }

  @Get(':id/quizzes/:quizId')
  async getQuizWithQuestions(
    @Param('id') _id: string,
    @Param('quizId') quizId: string,
  ) {
    return await this.documentService.getQuizWithQuestions(quizId);
  }

  @Post(':id/quizzes/:quizId/attempt')
  async submitQuizAttempt(
    @Param('id') _id: string,
    @Param('quizId') quizId: string,
    @CurrentUser() user: RequestUser,
    @Body() body: { answers: Record<string, string> },
  ) {
    return await this.documentService.submitQuizAttempt({
      quizId,
      userId: user.id,
      answers: body.answers,
    });
  }

  @Get(':id/quizzes/:quizId/attempts')
  async getQuizAttempts(
    @Param('id') _id: string,
    @Param('quizId') quizId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return await this.documentService.getQuizAttempts(user.id, quizId);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    await this.documentService.delete(id, user.id);
    return { success: true };
  }
}
