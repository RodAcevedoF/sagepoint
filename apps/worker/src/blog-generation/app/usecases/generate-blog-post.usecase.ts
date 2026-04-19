import { randomUUID } from "crypto";
import type {
  Category,
  IBlogPostGenerationService,
  IBlogPostRepository,
  INewsArticleRepository,
} from "@sagepoint/domain";
import { BlogPost, BlogPostSource } from "@sagepoint/domain";

const MIN_SOURCE_ARTICLES = 3;
const MAX_SOURCE_ARTICLES = 5;

function formatDateSuffix(date: Date): string {
  return date.toISOString().split("T")[0];
}

export class GenerateBlogPostUseCase {
  constructor(
    private readonly newsArticleRepo: INewsArticleRepository,
    private readonly blogPostRepo: IBlogPostRepository,
    private readonly generator: IBlogPostGenerationService,
  ) {}

  async execute(category: Category): Promise<BlogPost | null> {
    const articles = await this.newsArticleRepo.findByCategorySlugs([
      category.slug,
    ]);

    if (articles.length < MIN_SOURCE_ARTICLES) return null;

    const top = articles.slice(0, MAX_SOURCE_ARTICLES);

    const result = await this.generator.generate({
      categoryName: category.name,
      categorySlug: category.slug,
      sourceArticles: top.map((a) => ({
        title: a.title,
        description: a.description,
        url: a.url,
        source: a.source,
        publishedAt: a.publishedAt,
      })),
    });

    const publishedAt = new Date();
    const slug = `${result.suggestedSlug}-${formatDateSuffix(publishedAt)}`;
    const heroImageUrl = top.find((a) => a.imageUrl)?.imageUrl ?? null;
    const sources = top.map((a) => ({
      title: a.title,
      url: a.url,
      source: a.source,
    }));

    const post = new BlogPost(
      randomUUID(),
      slug,
      result.title,
      result.excerpt,
      result.contentMarkdown,
      heroImageUrl,
      category.id,
      category.slug,
      "Sagepoint Team",
      BlogPostSource.GENERATED,
      sources,
      publishedAt,
      publishedAt,
    );

    return this.blogPostRepo.save(post);
  }
}
