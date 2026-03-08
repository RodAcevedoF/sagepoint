import { Module } from '@nestjs/common';
import { InsightsController } from './infra/driver/http/insights.controller';
import { GetInsightsUseCase } from './app/usecases/get-insights.usecase';
import { getDependencies } from '@/core/bootstrap';
import {
  NEWS_SERVICE,
  CATEGORY_REPOSITORY,
  USER_REPOSITORY,
  ROADMAP_REPOSITORY,
} from '@sagepoint/domain';
import type {
  IUserRepository,
  IRoadmapRepository,
  ICategoryRepository,
  ICacheService,
  INewsService,
} from '@sagepoint/domain';
import { RedisCacheService } from '@/core/infra/cache/redis-cache.service';
import { CategoryModule } from '@/features/category/category.module';

@Module({
  imports: [CategoryModule],
  controllers: [InsightsController],
  providers: [
    {
      provide: NEWS_SERVICE,
      useFactory: () => getDependencies().newsService,
    },
    {
      provide: USER_REPOSITORY,
      useFactory: () => getDependencies().user.userRepository,
    },
    {
      provide: ROADMAP_REPOSITORY,
      useFactory: () => getDependencies().roadmap.roadmapRepository,
    },
    {
      provide: 'GetInsightsUseCase',
      useFactory: (
        userRepo: IUserRepository,
        roadmapRepo: IRoadmapRepository,
        categoryRepo: ICategoryRepository,
        cache: ICacheService,
        newsService: INewsService,
      ) =>
        new GetInsightsUseCase(
          userRepo,
          roadmapRepo,
          categoryRepo,
          cache,
          newsService,
        ),
      inject: [
        USER_REPOSITORY,
        ROADMAP_REPOSITORY,
        CATEGORY_REPOSITORY,
        RedisCacheService,
        NEWS_SERVICE,
      ],
    },
  ],
})
export class InsightsModule {}
