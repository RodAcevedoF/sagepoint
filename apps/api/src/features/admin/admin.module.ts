import { Module } from '@nestjs/common';
import { getDependencies } from '@/core/bootstrap';
import { AdminController } from './admin.controller';
import { ADMIN_SERVICE } from './domain/inbound/admin.service.port';
import { ADMIN_REPOSITORY } from './domain/outbound/admin.repository.port';
import { QUEUE_STATS_PROVIDER } from './domain/outbound/queue-stats.port';

@Module({
  controllers: [AdminController],
  providers: [
    {
      provide: ADMIN_SERVICE,
      useFactory: () => getDependencies().admin.adminService,
    },
    {
      provide: ADMIN_REPOSITORY,
      useFactory: () => getDependencies().admin.adminRepository,
    },
    {
      provide: QUEUE_STATS_PROVIDER,
      useFactory: () => getDependencies().admin.queueStatsProvider,
    },
  ],
})
export class AdminModule {}
