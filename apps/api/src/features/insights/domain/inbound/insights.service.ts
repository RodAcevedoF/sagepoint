import type { NewsArticle } from '@sagepoint/domain';

export const INSIGHTS_SERVICE = Symbol('INSIGHTS_SERVICE');

export interface IInsightsService {
  getForUser(userId: string): Promise<NewsArticle[]>;
  getPublic(limit?: number): Promise<NewsArticle[]>;
}
