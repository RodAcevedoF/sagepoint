import type {
  Category,
  ICategoryRepository,
  IBlogPostRepository,
} from "@sagepoint/domain";

export class PickNextCategoryUseCase {
  constructor(
    private readonly categoryRepo: ICategoryRepository,
    private readonly blogPostRepo: IBlogPostRepository,
  ) {}

  async execute(): Promise<Category | null> {
    const categories = await this.categoryRepo.list();
    if (categories.length === 0) return null;

    const scored = await Promise.all(
      categories.map(async (c) => {
        const latest = await this.blogPostRepo.findLatestByCategoryId(c.id);
        return { category: c, lastPublishedAt: latest?.publishedAt ?? null };
      }),
    );

    scored.sort((a, b) => {
      if (a.lastPublishedAt === null) return -1;
      if (b.lastPublishedAt === null) return 1;
      return a.lastPublishedAt.getTime() - b.lastPublishedAt.getTime();
    });

    return scored[0].category;
  }
}
