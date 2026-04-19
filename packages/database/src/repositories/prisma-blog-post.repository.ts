import {
  BlogPost,
  BlogPostSource,
  type BlogPostSourceRef,
  type IBlogPostRepository,
} from "@sagepoint/domain";
import type {
  BlogPost as PrismaBlogPost,
  Prisma,
  PrismaClient,
} from "../generated/prisma/client";

export class PrismaBlogPostRepository implements IBlogPostRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(post: BlogPost): Promise<BlogPost> {
    const saved = await this.prisma.blogPost.upsert({
      where: { slug: post.slug },
      create: {
        id: post.id,
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        contentMarkdown: post.contentMarkdown,
        heroImageUrl: post.heroImageUrl,
        categoryId: post.categoryId,
        author: post.author,
        source: post.source,
        sources: post.sources as unknown as Prisma.InputJsonValue,
        publishedAt: post.publishedAt,
        createdAt: post.createdAt,
      },
      update: {
        title: post.title,
        excerpt: post.excerpt,
        contentMarkdown: post.contentMarkdown,
        heroImageUrl: post.heroImageUrl,
        sources: post.sources as unknown as Prisma.InputJsonValue,
        publishedAt: post.publishedAt,
      },
      include: { category: { select: { slug: true } } },
    });
    const result = saved as typeof saved & { category: { slug: string } };
    return this.toDomain(result, result.category.slug);
  }

  async findBySlug(slug: string): Promise<BlogPost | null> {
    const found = await this.prisma.blogPost.findUnique({
      where: { slug },
      include: { category: { select: { slug: true } } },
    });
    return found ? this.toDomain(found, found.category.slug) : null;
  }

  async listPublished(limit: number): Promise<BlogPost[]> {
    const found = await this.prisma.blogPost.findMany({
      orderBy: { publishedAt: "desc" },
      take: limit,
      include: { category: { select: { slug: true } } },
    });
    return found.map((row) => this.toDomain(row, row.category.slug));
  }

  async findLatestByCategoryId(categoryId: string): Promise<BlogPost | null> {
    const found = await this.prisma.blogPost.findFirst({
      where: { categoryId },
      orderBy: { publishedAt: "desc" },
      include: { category: { select: { slug: true } } },
    });
    return found ? this.toDomain(found, found.category.slug) : null;
  }

  private toDomain(model: PrismaBlogPost, categorySlug: string): BlogPost {
    return new BlogPost(
      model.id,
      model.slug,
      model.title,
      model.excerpt,
      model.contentMarkdown,
      model.heroImageUrl ?? null,
      model.categoryId,
      categorySlug,
      model.author,
      model.source as BlogPostSource,
      (model.sources as unknown as BlogPostSourceRef[]) ?? [],
      model.publishedAt,
      model.createdAt,
    );
  }
}
