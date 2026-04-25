import { PickNextCategoryUseCase } from "../../../src/blog-generation/app/usecases/pick-next-category.usecase";
import { Category, BlogPost, BlogPostSource } from "@sagepoint/domain";
import type {
  ICategoryRepository,
  IBlogPostRepository,
} from "@sagepoint/domain";

function buildCategory(id: string, slug: string): Category {
  return Category.create(id, `Category ${id}`, slug);
}

function buildPost(categoryId: string, publishedAt: Date): BlogPost {
  return new BlogPost(
    `post-${categoryId}`,
    "slug",
    "Title",
    "Excerpt",
    "Content",
    null,
    categoryId,
    "slug",
    "Author",
    BlogPostSource.GENERATED,
    [],
    publishedAt,
    publishedAt,
  );
}

function fakeCategoryRepo(categories: Category[]): ICategoryRepository {
  return {
    list: () => Promise.resolve(categories),
    save: (c) => Promise.resolve(c),
    findOrCreateBySlug: (c) => Promise.resolve(c),
    findById: () => Promise.resolve(null),
    findBySlug: () => Promise.resolve(null),
    delete: () => Promise.resolve(),
  };
}

function fakeBlogPostRepo(
  latestByCategory: Map<string, BlogPost | null>,
): IBlogPostRepository {
  return {
    findLatestByCategoryId: (id) =>
      Promise.resolve(latestByCategory.get(id) ?? null),
    save: (p) => Promise.resolve(p),
    findBySlug: () => Promise.resolve(null),
    listPublished: () =>
      Promise.resolve({ data: [], total: 0, page: 1, limit: 12 }),
  };
}

function buildUseCase(
  categories: Category[],
  latestByCategory: Map<string, BlogPost | null> = new Map(),
) {
  return new PickNextCategoryUseCase(
    fakeCategoryRepo(categories),
    fakeBlogPostRepo(latestByCategory),
  );
}

describe("PickNextCategoryUseCase", () => {
  it("returns null when there are no categories", async () => {
    const result = await buildUseCase([]).execute();
    expect(result).toBeNull();
  });

  it("picks the category that has never had a post", async () => {
    const cats = [
      buildCategory("1", "web"),
      buildCategory("2", "ai"),
      buildCategory("3", "devops"),
    ];
    const latest = new Map<string, BlogPost | null>([
      ["1", buildPost("1", new Date("2026-03-01"))],
      ["2", null],
      ["3", buildPost("3", new Date("2026-04-01"))],
    ]);

    const result = await buildUseCase(cats, latest).execute();
    expect(result?.id).toBe("2");
  });

  it("picks the category with the oldest last post when all have posts", async () => {
    const cats = [
      buildCategory("1", "web"),
      buildCategory("2", "ai"),
      buildCategory("3", "devops"),
    ];
    const latest = new Map<string, BlogPost | null>([
      ["1", buildPost("1", new Date("2026-04-01"))],
      ["2", buildPost("2", new Date("2026-01-01"))],
      ["3", buildPost("3", new Date("2026-02-01"))],
    ]);

    const result = await buildUseCase(cats, latest).execute();
    expect(result?.id).toBe("2");
  });

  it("returns the single category when only one exists", async () => {
    const cats = [buildCategory("1", "web")];
    const result = await buildUseCase(cats).execute();
    expect(result?.id).toBe("1");
  });

  it("when multiple categories have no posts, picks one of them", async () => {
    const cats = [buildCategory("1", "web"), buildCategory("2", "ai")];

    const result = await buildUseCase(cats, new Map()).execute();
    expect(["1", "2"]).toContain(result?.id);
  });

  it("prefers never-posted over oldest-posted", async () => {
    const cats = [buildCategory("1", "web"), buildCategory("2", "ai")];
    const latest = new Map<string, BlogPost | null>([
      ["1", buildPost("1", new Date("2020-01-01"))],
      ["2", null],
    ]);

    const result = await buildUseCase(cats, latest).execute();
    expect(result?.id).toBe("2");
  });
});
