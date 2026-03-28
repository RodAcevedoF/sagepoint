import type { NewsArticle } from "../entities/news-article.entity";

export const NEWS_ARTICLE_REPOSITORY = Symbol("NEWS_ARTICLE_REPOSITORY");

export interface INewsArticleRepository {
  upsertMany(articles: NewsArticle[]): Promise<void>;
  findByCategorySlugs(slugs: string[]): Promise<NewsArticle[]>;
  deleteOlderThan(date: Date): Promise<number>;
}
