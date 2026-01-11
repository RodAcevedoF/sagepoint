import { Module } from '@nestjs/common';
import { ROADMAP_SERVICE } from '@/features/roadmap/domain/inbound/roadmap.service';
import { ROADMAP_REPOSITORY } from '@sagepoint/domain';
import { RoadmapController } from '@/features/roadmap/infra/driver/http/roadmap.controller';
import { getDependencies } from '@/core/bootstrap';

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
  ],
  exports: [ROADMAP_SERVICE],
})
export class RoadmapModule {}
