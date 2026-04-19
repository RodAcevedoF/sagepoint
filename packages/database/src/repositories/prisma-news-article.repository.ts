import { NewsArticle } from "@sagepoint/domain";
import type { INewsArticleRepository } from "@sagepoint/domain";
import type {
  NewsArticle as PrismaNewsArticle,
  PrismaClient,
} from "../generated/prisma/client";

export class PrismaNewsArticleRepository implements INewsArticleRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async upsertMany(articles: NewsArticle[]): Promise<void> {
    await this.prisma.$transaction(
      articles.map((a) =>
        this.prisma.newsArticle.upsert({
          where: { url: a.url },
          create: {
            id: a.id,
            title: a.title,
            description: a.description,
            url: a.url,
            imageUrl: a.imageUrl,
            source: a.source,
            publishedAt: a.publishedAt,
            categoryId: a.categoryId,
          },
          update: {
            title: a.title,
            description: a.description,
            imageUrl: a.imageUrl,
            source: a.source,
            publishedAt: a.publishedAt,
          },
        }),
      ),
    );
  }

  async findByCategorySlugs(slugs: string[]): Promise<NewsArticle[]> {
    const found = await this.prisma.newsArticle.findMany({
      where: { category: { slug: { in: slugs } } },
      include: { category: { select: { slug: true } } },
      orderBy: { publishedAt: "desc" },
      take: 30,
    });
    return found.map((row) => this.toDomain(row, row.category.slug));
  }

  async findRecent(limit: number): Promise<NewsArticle[]> {
    const found = await this.prisma.newsArticle.findMany({
      orderBy: { publishedAt: "desc" },
      take: limit,
      include: { category: { select: { slug: true } } },
    });
    return found.map((row) => this.toDomain(row, row.category.slug));
  }

  async deleteOlderThan(date: Date): Promise<number> {
    const result = await this.prisma.newsArticle.deleteMany({
      where: { createdAt: { lt: date } },
    });
    return result.count;
  }

  private toDomain(
    model: PrismaNewsArticle,
    categorySlug: string,
  ): NewsArticle {
    return new NewsArticle(
      model.id,
      model.title,
      model.description,
      model.url,
      model.imageUrl ?? null,
      model.source,
      model.publishedAt,
      model.categoryId,
      categorySlug,
      model.createdAt,
    );
  }
}
