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

export interface InsightsDependencies {
  newsArticleRepository: INewsArticleRepository;
  getInsightsUseCase: GetInsightsUseCase;
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

  return {
    newsArticleRepository,
    getInsightsUseCase,
  };
}
