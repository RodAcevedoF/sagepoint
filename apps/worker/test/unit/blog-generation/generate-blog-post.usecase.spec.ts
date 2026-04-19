import { GenerateBlogPostUseCase } from "../../../src/blog-generation/app/usecases/generate-blog-post.usecase";
import {
  Category,
  BlogPost,
  BlogPostSource,
  NewsArticle,
} from "@sagepoint/domain";
import type {
  IBlogPostRepository,
  IBlogPostGenerationService,
  INewsArticleRepository,
  BlogPostGenerationResult,
} from "@sagepoint/domain";

function buildCategory(): Category {
  return Category.create("cat-1", "Web Development", "web-development");
}

function buildArticle(overrides?: {
  id?: string;
  title?: string;
  imageUrl?: string | null;
}): NewsArticle {
  return new NewsArticle(
    overrides?.id ?? "art-1",
    overrides?.title ?? "Article Title",
    "Description",
    "https://example.com/article",
    overrides?.imageUrl ?? null,
    "Source",
    new Date("2026-04-01"),
    "content",
    "web-development",
  );
}

function fakeNewsRepo(articles: NewsArticle[]): INewsArticleRepository {
  return {
    findByCategorySlugs: () => Promise.resolve(articles),
    upsertMany: () => Promise.resolve(),
    findRecent: () => Promise.resolve([]),
    deleteOlderThan: () => Promise.resolve(0),
  };
}

function fakeBlogPostRepo(): IBlogPostRepository & { saved: BlogPost | null } {
  const repo = {
    saved: null as BlogPost | null,
    save(post: BlogPost) {
      repo.saved = post;
      return Promise.resolve(post);
    },
    findBySlug: () => Promise.resolve(null),
    listPublished: () => Promise.resolve([]),
    findLatestByCategoryId: () => Promise.resolve(null),
  };
  return repo;
}

function fakeGenerator(
  result: BlogPostGenerationResult,
): IBlogPostGenerationService {
  return { generate: () => Promise.resolve(result) };
}

const DEFAULT_RESULT: BlogPostGenerationResult = {
  title: "Generated Title",
  excerpt: "Generated excerpt.",
  contentMarkdown: "# Content",
  suggestedSlug: "generated-title",
};

function buildUseCase(
  articles: NewsArticle[],
  repo = fakeBlogPostRepo(),
  generatorResult = DEFAULT_RESULT,
) {
  const newsRepo = fakeNewsRepo(articles);
  const generator = fakeGenerator(generatorResult);
  const useCase = new GenerateBlogPostUseCase(newsRepo, repo, generator);
  return { useCase, repo };
}

describe("GenerateBlogPostUseCase", () => {
  it("returns null when fewer than 3 articles are available", async () => {
    const { useCase } = buildUseCase([buildArticle(), buildArticle()]);
    const result = await useCase.execute(buildCategory());
    expect(result).toBeNull();
  });

  it("returns null when exactly 2 articles (boundary)", async () => {
    const articles = [buildArticle({ id: "1" }), buildArticle({ id: "2" })];
    const { useCase } = buildUseCase(articles);
    expect(await useCase.execute(buildCategory())).toBeNull();
  });

  it("generates and saves a post when 3 or more articles are available", async () => {
    const articles = [1, 2, 3].map((i) => buildArticle({ id: `${i}` }));
    const { useCase, repo } = buildUseCase(articles);

    const result = await useCase.execute(buildCategory());

    expect(result).not.toBeNull();
    expect(repo.saved).toBe(result);
    expect(result?.source).toBe(BlogPostSource.GENERATED);
    expect(result?.categoryId).toBe("cat-1");
    expect(result?.author).toBe("Sagepoint Team");
  });

  it("slug is suggestedSlug suffixed with today's date", async () => {
    const articles = [1, 2, 3].map((i) => buildArticle({ id: `${i}` }));
    const { useCase } = buildUseCase(articles);

    const before = new Date();
    const result = await useCase.execute(buildCategory());
    const after = new Date();

    const datePart = result!.slug.split("-").slice(-3).join("-");
    const generatedDate = new Date(datePart);
    expect(generatedDate >= new Date(before.toISOString().split("T")[0])).toBe(
      true,
    );
    expect(generatedDate <= new Date(after.toISOString().split("T")[0])).toBe(
      true,
    );
    expect(result!.slug.startsWith("generated-title-")).toBe(true);
  });

  it("uses the first article imageUrl as heroImageUrl", async () => {
    const articles = [
      buildArticle({ id: "1", imageUrl: null }),
      buildArticle({ id: "2", imageUrl: "https://img.example.com/photo.jpg" }),
      buildArticle({ id: "3", imageUrl: null }),
    ];
    const { useCase } = buildUseCase(articles);
    const result = await useCase.execute(buildCategory());
    expect(result?.heroImageUrl).toBe("https://img.example.com/photo.jpg");
  });

  it("sets heroImageUrl to null when no article has an image", async () => {
    const articles = [1, 2, 3].map((i) =>
      buildArticle({ id: `${i}`, imageUrl: null }),
    );
    const { useCase } = buildUseCase(articles);
    const result = await useCase.execute(buildCategory());
    expect(result?.heroImageUrl).toBeNull();
  });

  it("caps source articles at 5 even when more are available", async () => {
    const generatorSpy = {
      calledWith: null as
        | Parameters<IBlogPostGenerationService["generate"]>[0]
        | null,
      generate(input: Parameters<IBlogPostGenerationService["generate"]>[0]) {
        generatorSpy.calledWith = input;
        return Promise.resolve(DEFAULT_RESULT);
      },
    };
    const articles = [1, 2, 3, 4, 5, 6, 7].map((i) =>
      buildArticle({ id: `${i}` }),
    );
    const repo = fakeBlogPostRepo();
    const useCase = new GenerateBlogPostUseCase(
      fakeNewsRepo(articles),
      repo,
      generatorSpy,
    );

    await useCase.execute(buildCategory());

    expect(generatorSpy.calledWith?.sourceArticles).toHaveLength(5);
  });
});
