import type {
  INewsArticleRepository,
  IUserRepository,
  IRoadmapRepository,
  ICategoryRepository,
  ICacheService,
} from '@sagepoint/domain';
import type { PrismaClient } from '@sagepoint/database';
import { PrismaNewsArticleRepository } from '@sagepoint/database';
import { GetInsightsUseCase } from './app/usecases/get-insights.usecase';
import { GetPublicInsightsUseCase } from './app/usecases/get-public-insights.usecase';
import { InsightsService } from './infra/driver/insights.service';

export interface InsightsDependencies {
  newsArticleRepository: INewsArticleRepository;
  insightsService: InsightsService;
}

export function makeInsightsDependencies(
  prismaService: PrismaClient,
  userRepo: IUserRepository,
  roadmapRepo: IRoadmapRepository,
  categoryRepo: ICategoryRepository,
  cache: ICacheService,
): InsightsDependencies {
  const newsArticleRepository = new PrismaNewsArticleRepository(prismaService);

  const getInsightsUseCase = new GetInsightsUseCase(
    userRepo,
    roadmapRepo,
    categoryRepo,
    cache,
    newsArticleRepository,
  );

  const getPublicInsightsUseCase = new GetPublicInsightsUseCase(
    cache,
    newsArticleRepository,
  );

  const insightsService = new InsightsService(
    getInsightsUseCase,
    getPublicInsightsUseCase,
  );

  return { newsArticleRepository, insightsService };
}
