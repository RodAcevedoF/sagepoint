import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Inject,
  NotFoundException,
  UseGuards,
  Sse,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { QueueEvents } from 'bullmq';
import { JwtAuthGuard } from '@/features/auth/infra/guards/jwt-auth.guard';
import { CurrentUser } from '@/features/auth/decorators/current-user.decorator';
import type { RequestUser, UserContext } from '@sagepoint/domain';
import { StepStatus } from '@sagepoint/domain';
import {
  ROADMAP_SERVICE,
  type IRoadmapService,
} from '@/features/roadmap/domain/inbound/roadmap.service';

interface GenerateRoadmapDto {
  documentId: string;
  title: string;
}

interface GenerateTopicRoadmapDto {
  topic: string;
  title?: string;
  userContext?: UserContext;
}

interface UpdateStepProgressDto {
  status: StepStatus;
}

interface RefreshResourcesDto {
  conceptIds?: string[];
}

interface SseEvent {
  data: string;
}

@Controller('roadmaps')
export class RoadmapController {
  constructor(
    @Inject(ROADMAP_SERVICE)
    private readonly roadmapService: IRoadmapService,
    @Inject('ROADMAP_QUEUE_EVENTS')
    private readonly queueEvents: QueueEvents,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async generate(
    @Body() dto: GenerateRoadmapDto,
    @CurrentUser() user: RequestUser,
  ) {
    const roadmap = await this.roadmapService.generate({
      ...dto,
      userId: user.id,
    });
    return roadmap;
  }

  @Post('from-topic')
  @UseGuards(JwtAuthGuard)
  async generateFromTopic(
    @Body() dto: GenerateTopicRoadmapDto,
    @CurrentUser() user: RequestUser,
  ) {
    const roadmap = await this.roadmapService.generateFromTopic({
      topic: dto.topic,
      title: dto.title,
      userId: user.id,
      userContext: dto.userContext,
    });
    return roadmap;
  }

  @Sse(':id/events')
  events(@Param('id') roadmapId: string): Observable<SseEvent> {
    return new Observable<SseEvent>((subscriber) => {
      let done = false;

      const finish = () => {
        if (done) return;
        done = true;
        cleanup();
        subscriber.complete();
      };

      // 1. Subscribe to BullMQ events FIRST (so nothing is missed)
      const onProgress = (args: { jobId: string; data: unknown }) => {
        if (args.jobId === roadmapId) {
          subscriber.next({
            data: JSON.stringify({
              type: 'progress',
              ...(args.data as Record<string, unknown>),
            }),
          });
        }
      };

      const onCompleted = (args: { jobId: string }) => {
        if (args.jobId === roadmapId) {
          subscriber.next({
            data: JSON.stringify({ type: 'completed' }),
          });
          finish();
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

      this.queueEvents.on('progress', onProgress);
      this.queueEvents.on('completed', onCompleted);
      this.queueEvents.on('failed', onFailed);

      const cleanup = () => {
        this.queueEvents.off('progress', onProgress);
        this.queueEvents.off('completed', onCompleted);
        this.queueEvents.off('failed', onFailed);
      };

      // 2. THEN check DB for already-terminal state (handles race condition)
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

          if (roadmap.generationStatus === 'completed') {
            subscriber.next({
              data: JSON.stringify({ type: 'completed' }),
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

          // Still in progress — emit current status, keep stream open for live events
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

      // Teardown on client disconnect
      return cleanup;
    });
  }

  @Get('user/me')
  @UseGuards(JwtAuthGuard)
  async getUserRoadmaps(@CurrentUser() user: RequestUser) {
    return this.roadmapService.getUserRoadmaps(user.id);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const roadmap = await this.roadmapService.findById(id);
    if (!roadmap) {
      throw new NotFoundException(`Roadmap ${id} not found`);
    }
    return roadmap;
  }

  @Get(':id/with-progress')
  @UseGuards(JwtAuthGuard)
  async findByIdWithProgress(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
  ) {
    const result = await this.roadmapService.getUserRoadmapById(user.id, id);
    if (!result) {
      throw new NotFoundException(`Roadmap ${id} not found`);
    }
    return result;
  }

  @Get(':id/resources')
  async getResources(@Param('id') id: string) {
    return this.roadmapService.getResourcesByRoadmap(id);
  }

  @Get('document/:documentId')
  async findByDocumentId(@Param('documentId') documentId: string) {
    return this.roadmapService.findByDocumentId(documentId);
  }

  @Patch(':id/steps/:conceptId/progress')
  @UseGuards(JwtAuthGuard)
  async updateStepProgress(
    @Param('id') roadmapId: string,
    @Param('conceptId') conceptId: string,
    @Body() dto: UpdateStepProgressDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.roadmapService.updateStepProgress({
      userId: user.id,
      roadmapId,
      conceptId,
      status: dto.status,
    });
  }

  @Post(':id/refresh-resources')
  @UseGuards(JwtAuthGuard)
  async refreshResources(
    @Param('id') roadmapId: string,
    @Body() dto: RefreshResourcesDto,
  ) {
    return this.roadmapService.refreshResources({
      roadmapId,
      conceptIds: dto.conceptIds,
    });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: string) {
    await this.roadmapService.delete(id);
    return { deleted: true };
  }

  @Get('graph/:documentId')
  async getGraph(@Param('documentId') documentId: string) {
    return this.roadmapService.getGraph(documentId);
  }
}
