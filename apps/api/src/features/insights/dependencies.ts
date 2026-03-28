import type { INewsArticleRepository } from '@sagepoint/domain';
import { PrismaNewsArticleRepository } from '@sagepoint/database';
import { PrismaService } from '@/core/infra/database/prisma.service';

export interface InsightsDependencies {
  newsArticleRepository: INewsArticleRepository;
}

export function makeInsightsDependencies(): InsightsDependencies {
  const prismaService = new PrismaService();
  const newsArticleRepository = new PrismaNewsArticleRepository(prismaService);

  return {
    newsArticleRepository,
  };
}
