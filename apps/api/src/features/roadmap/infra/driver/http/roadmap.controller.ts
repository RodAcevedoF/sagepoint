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
  Query,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { QueueEvents } from 'bullmq';
import { JwtAuthGuard } from '@/features/auth/infra/guards/jwt-auth.guard';
import { CurrentUser } from '@/features/auth/decorators/current-user.decorator';
import type {
  RequestUser,
  UserContext,
  RoadmapVisibility,
} from '@sagepoint/domain';
import { StepStatus } from '@sagepoint/domain';
import {
  ROADMAP_SERVICE,
  type IRoadmapService,
} from '@/features/roadmap/domain/inbound/roadmap.service';
import { SearchPublicRoadmapsDto } from '@/features/roadmap/app/dto/search-public-roadmaps.dto';

interface GenerateRoadmapDto {
  documentId: string;
  title?: string;
  userContext?: UserContext;
}

interface GenerateTopicRoadmapDto {
  topic: string;
  title?: string;
  userContext?: UserContext;
}

interface UpdateStepProgressDto {
  status: StepStatus;
}

interface UpdateVisibilityDto {
  visibility: RoadmapVisibility;
}

interface UpdateCategoryDto {
  categoryId: string | null;
}

interface RefreshResourcesDto {
  conceptIds?: string[];
}

interface SubmitStepQuizDto {
  answers: Record<number, string>;
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
    @Inject('ROADMAP_RESOURCES_QUEUE_EVENTS')
    private readonly resourcesQueueEvents: QueueEvents,
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

      // Phase 1 (roadmap-generation) handlers
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
          // Phase 1 done — roadmap is navigable, keep stream open for phase 2
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

      // Phase 2 (roadmap-resources) handlers
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

      // Teardown on client disconnect
      return cleanup;
    });
  }

  @Get('public')
  async getPublicRoadmaps() {
    return this.roadmapService.getPublicRoadmaps();
  }

  @Get('search')
  async searchPublicRoadmaps(@Query() dto: SearchPublicRoadmapsDto) {
    return this.roadmapService.searchPublicRoadmaps(dto.q, dto.limit);
  }

  @Post(':id/adopt')
  @UseGuards(JwtAuthGuard)
  async adoptRoadmap(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.roadmapService.adoptRoadmap(user.id, id);
  }

  @Delete(':id/adopt')
  @UseGuards(JwtAuthGuard)
  async unadoptRoadmap(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
  ) {
    await this.roadmapService.unadoptRoadmap(user.id, id);
    return { adopted: false };
  }

  @Get('user/me')
  @UseGuards(JwtAuthGuard)
  async getUserRoadmaps(@CurrentUser() user: RequestUser) {
    return this.roadmapService.getUserRoadmaps(user.id);
  }

  @Get('user/me/activity')
  @UseGuards(JwtAuthGuard)
  async getUserActivity(
    @CurrentUser() user: RequestUser,
    @Query('days') days?: string,
  ) {
    const parsedDays = days ? Math.min(parseInt(days, 10) || 90, 365) : 90;
    return this.roadmapService.getUserActivity(user.id, parsedDays);
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

  @Post(':id/steps/:conceptId/quiz')
  @UseGuards(JwtAuthGuard)
  async generateStepQuiz(
    @Param('id') roadmapId: string,
    @Param('conceptId') conceptId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.roadmapService.generateStepQuiz({
      userId: user.id,
      roadmapId,
      conceptId,
    });
  }

  @Post(':id/quiz/:attemptId/submit')
  @UseGuards(JwtAuthGuard)
  async submitStepQuiz(
    @Param('attemptId') attemptId: string,
    @Body() dto: SubmitStepQuizDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.roadmapService.submitStepQuiz({
      userId: user.id,
      attemptId,
      answers: dto.answers,
    });
  }

  @Post(':id/steps/:conceptId/expand')
  @UseGuards(JwtAuthGuard)
  async expandConcept(
    @Param('id') roadmapId: string,
    @Param('conceptId') conceptId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.roadmapService.expandConcept({
      roadmapId,
      conceptId,
      userId: user.id,
    });
  }

  @Get(':id/suggestions')
  async getSuggestions(@Param('id') id: string) {
    return this.roadmapService.getSuggestions(id);
  }

  @Patch(':id/visibility')
  @UseGuards(JwtAuthGuard)
  async updateVisibility(
    @Param('id') id: string,
    @Body() dto: UpdateVisibilityDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.roadmapService.updateVisibility(id, user.id, dto.visibility);
  }

  @Patch(':id/category')
  @UseGuards(JwtAuthGuard)
  async updateCategory(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.roadmapService.updateCategory(id, user.id, dto.categoryId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    await this.roadmapService.delete(id, user.id);
    return { deleted: true };
  }

  @Get('graph/:documentId')
  async getGraph(@Param('documentId') documentId: string) {
    return this.roadmapService.getGraph(documentId);
  }
}
