import type { IInsightsService } from '../../domain/inbound/insights.service';
import type { NewsArticle } from '@sagepoint/domain';
import { GetInsightsUseCase } from '../../app/usecases/get-insights.usecase';
import { GetPublicInsightsUseCase } from '../../app/usecases/get-public-insights.usecase';

export class InsightsService implements IInsightsService {
  constructor(
    private readonly getInsightsUseCase: GetInsightsUseCase,
    private readonly getPublicInsightsUseCase: GetPublicInsightsUseCase,
  ) {}

  getForUser(userId: string): Promise<NewsArticle[]> {
    return this.getInsightsUseCase.execute(userId);
  }

  getPublic(limit = 13): Promise<NewsArticle[]> {
    return this.getPublicInsightsUseCase.execute(limit);
  }
}
