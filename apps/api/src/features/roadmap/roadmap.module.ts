import { Module } from '@nestjs/common';
import { ROADMAP_SERVICE } from '@/features/roadmap/domain/inbound/roadmap.service';
import { ROADMAP_PROGRESS_SERVICE } from '@/features/roadmap/domain/inbound/roadmap-progress.service';
import { RoadmapProgressServiceImpl } from '@/features/roadmap/infra/services/roadmap-progress.service';
import { ROADMAP_REPOSITORY, ROADMAP_RESOURCES_QUEUE } from '@sagepoint/domain';
import { RoadmapController } from '@/features/roadmap/infra/driver/http/roadmap.controller';
import { getDependencies } from '@/core/bootstrap';
import { QueueEvents } from 'bullmq';
import type { IRoadmapService } from '@/features/roadmap/domain/inbound/roadmap.service';

function makeQueueEvents(name: string): QueueEvents {
  return new QueueEvents(name, {
    connection: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      db: parseInt(process.env.REDIS_DB || '0'),
    },
  });
}

@Module({
  controllers: [RoadmapController],
  providers: [
    {
      provide: ROADMAP_SERVICE,
      useFactory: () => getDependencies().roadmap.roadmapService,
    },
    {
      provide: ROADMAP_REPOSITORY,
      useFactory: () => getDependencies().roadmap.roadmapRepository,
    },
    {
      provide: 'ROADMAP_QUEUE_EVENTS',
      useFactory: () => makeQueueEvents('roadmap-generation'),
    },
    {
      provide: 'ROADMAP_RESOURCES_QUEUE_EVENTS',
      useFactory: () => makeQueueEvents(ROADMAP_RESOURCES_QUEUE),
    },
    {
      provide: ROADMAP_PROGRESS_SERVICE,
      useFactory: (qe: QueueEvents, rqe: QueueEvents, svc: IRoadmapService) =>
        new RoadmapProgressServiceImpl(qe, rqe, svc),
      inject: [
        'ROADMAP_QUEUE_EVENTS',
        'ROADMAP_RESOURCES_QUEUE_EVENTS',
        ROADMAP_SERVICE,
      ],
    },
  ],
  exports: [ROADMAP_SERVICE],
})
export class RoadmapModule {}
