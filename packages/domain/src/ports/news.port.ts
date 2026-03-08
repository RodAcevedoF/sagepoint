import type { NewsArticle } from '../modules/insights/entities/news-article.entity';

export const NEWS_SERVICE = Symbol('NEWS_SERVICE');

export interface INewsService {
  fetchByCategory(slug: string, name: string): Promise<NewsArticle[]>;
}
