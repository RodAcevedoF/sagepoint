import { Module } from '@nestjs/common';
import { InsightsController } from './infra/driver/http/insights.controller';
import { getDependencies } from '@/core/bootstrap';
import { NEWS_ARTICLE_REPOSITORY } from '@sagepoint/domain';

@Module({
  controllers: [InsightsController],
  providers: [
    {
      provide: NEWS_ARTICLE_REPOSITORY,
      useFactory: () => getDependencies().insights.newsArticleRepository,
    },
    {
      provide: 'GetInsightsUseCase',
      useFactory: () => getDependencies().insights.getInsightsUseCase,
    },
  ],
})
export class InsightsModule {}
