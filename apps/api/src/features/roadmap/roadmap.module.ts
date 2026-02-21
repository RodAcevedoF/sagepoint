import { Module } from '@nestjs/common';
import { ROADMAP_SERVICE } from '@/features/roadmap/domain/inbound/roadmap.service';
import { ROADMAP_REPOSITORY } from '@sagepoint/domain';
import { RoadmapController } from '@/features/roadmap/infra/driver/http/roadmap.controller';
import { getDependencies } from '@/core/bootstrap';
import { QueueEvents } from 'bullmq';

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
      useFactory: () => {
        return new QueueEvents('roadmap-generation', {
          connection: {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379'),
          },
        });
      },
    },
  ],
  exports: [ROADMAP_SERVICE],
})
export class RoadmapModule {}
