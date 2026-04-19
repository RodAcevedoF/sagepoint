import { Module } from '@nestjs/common';
import { InsightsController } from './infra/driver/http/insights.controller';
import { INSIGHTS_SERVICE } from './domain/inbound/insights.service';
import { getDependencies } from '@/core/bootstrap';

@Module({
  controllers: [InsightsController],
  providers: [
    {
      provide: INSIGHTS_SERVICE,
      useFactory: () => getDependencies().insights.insightsService,
    },
  ],
})
export class InsightsModule {}
