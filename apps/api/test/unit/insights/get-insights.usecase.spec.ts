import { GetInsightsUseCase } from '../../../src/features/insights/app/usecases/get-insights.usecase';
import {
  User,
  UserRole,
  Category,
  Roadmap,
  Concept,
  NewsArticle,
} from '@sagepoint/domain';
import type {
  IUserRepository,
  IRoadmapRepository,
  ICategoryRepository,
  ICacheService,
  INewsArticleRepository,
  INewsService,
} from '@sagepoint/domain';

const webDevCategory = Category.create(
  'c1',
  'Web Development',
  'web-development',
);
const mlCategory = Category.create(
  'c2',
  'Machine Learning',
  'machine-learning',
);

function buildArticle(slug: string, daysAgo: number): NewsArticle {
  const date = new Date(Date.now() - daysAgo * 86400000);
  return new NewsArticle(
    `art-${slug}-${daysAgo}`,
    `Article about ${slug}`,
    `Description for ${slug}`,
    `https://example.com/${slug}/${daysAgo}`,
    null,
    'TechBlog',
    date,
    slug === 'web-development' ? 'c1' : 'c2',
    slug,
  );
}

function createMocks() {
  const cache = new Map<string, unknown>();

  const userRepo = {
    findById: jest
      .fn()
      .mockResolvedValue(
        new User(
          'u1',
          'test@example.com',
          'Test',
          UserRole.USER,
          undefined,
          true,
          true,
          null,
          null,
          null,
          null,
          undefined,
          [webDevCategory],
        ),
      ),
  } as unknown as IUserRepository & { findById: jest.Mock };

  const roadmapRepo = {
    findByUserId: jest.fn().mockResolvedValue([]),
  } as unknown as IRoadmapRepository & { findByUserId: jest.Mock };

  const categoryRepo = {
    list: jest.fn().mockResolvedValue([webDevCategory, mlCategory]),
  } as unknown as ICategoryRepository;

  const cacheService = {
    get: jest
      .fn()
      .mockImplementation((key: string) =>
        Promise.resolve(cache.get(key) ?? null),
      ),
    set: jest.fn().mockImplementation((key: string, value: unknown) => {
      cache.set(key, value);
      return Promise.resolve();
    }),
    del: jest.fn(),
    delByPattern: jest.fn(),
  } as unknown as ICacheService & { get: jest.Mock; set: jest.Mock };

  const newsArticleRepo = {
    findByCategorySlugs: jest
      .fn()
      .mockImplementation((slugs: string[]) =>
        Promise.resolve(
          slugs.flatMap((slug) => [
            buildArticle(slug, 1),
            buildArticle(slug, 2),
          ]),
        ),
      ),
    upsertMany: jest.fn().mockResolvedValue(undefined),
    deleteOlderThan: jest.fn().mockResolvedValue(0),
  } as unknown as INewsArticleRepository & {
    findByCategorySlugs: jest.Mock;
    upsertMany: jest.Mock;
  };

  const newsService = {
    fetchByCategory: jest.fn().mockResolvedValue([]),
  } as unknown as INewsService & { fetchByCategory: jest.Mock };

  return {
    userRepo,
    roadmapRepo,
    categoryRepo,
    cacheService,
    newsArticleRepo,
    newsService,
    cache,
  };
}

describe('GetInsightsUseCase', () => {
  describe('fetching news by user interests', () => {
    it('returns articles for categories the user is interested in', async () => {
      const {
        userRepo,
        roadmapRepo,
        categoryRepo,
        cacheService,
        newsArticleRepo,
        newsService,
      } = createMocks();
      const useCase = new GetInsightsUseCase(
        userRepo,
        roadmapRepo,
        categoryRepo,
        cacheService,
        newsArticleRepo,
        newsService,
      );

      const result = await useCase.execute('u1');

      expect(result.length).toBeGreaterThan(0);
      expect(newsArticleRepo.findByCategorySlugs).toHaveBeenCalledWith([
        'web-development',
      ]);
    });

    it('returns empty array when user has no interests and no roadmaps', async () => {
      const {
        userRepo,
        roadmapRepo,
        categoryRepo,
        cacheService,
        newsArticleRepo,
        newsService,
      } = createMocks();
      userRepo.findById.mockResolvedValue(
        User.create('u1', 'test@example.com', 'Test'),
      );
      const useCase = new GetInsightsUseCase(
        userRepo,
        roadmapRepo,
        categoryRepo,
        cacheService,
        newsArticleRepo,
        newsService,
      );

      const result = await useCase.execute('u1');

      expect(result).toEqual([]);
      expect(newsArticleRepo.findByCategorySlugs).not.toHaveBeenCalled();
    });

    it('returns empty array when user does not exist', async () => {
      const {
        userRepo,
        roadmapRepo,
        categoryRepo,
        cacheService,
        newsArticleRepo,
        newsService,
      } = createMocks();
      userRepo.findById.mockResolvedValue(null);
      const useCase = new GetInsightsUseCase(
        userRepo,
        roadmapRepo,
        categoryRepo,
        cacheService,
        newsArticleRepo,
        newsService,
      );

      expect(await useCase.execute('nonexistent')).toEqual([]);
    });
  });

  describe('category merging from roadmaps', () => {
    it('includes categories from user roadmaps', async () => {
      const {
        userRepo,
        roadmapRepo,
        categoryRepo,
        cacheService,
        newsArticleRepo,
        newsService,
      } = createMocks();
      userRepo.findById.mockResolvedValue(User.create('u1', 'a@b.com', 'A'));
      roadmapRepo.findByUserId.mockResolvedValue([
        new Roadmap({
          id: 'r1',
          title: 'ML Roadmap',
          categoryId: 'c2',
          steps: [
            { concept: Concept.create('x', 'X'), order: 1, dependsOn: [] },
          ],
          createdAt: new Date(),
        }),
      ]);
      const useCase = new GetInsightsUseCase(
        userRepo,
        roadmapRepo,
        categoryRepo,
        cacheService,
        newsArticleRepo,
        newsService,
      );

      const result = await useCase.execute('u1');

      expect(newsArticleRepo.findByCategorySlugs).toHaveBeenCalledWith([
        'machine-learning',
      ]);
      expect(result.length).toBeGreaterThan(0);
    });

    it('deduplicates categories from interests and roadmaps', async () => {
      const {
        userRepo,
        roadmapRepo,
        categoryRepo,
        cacheService,
        newsArticleRepo,
        newsService,
      } = createMocks();
      roadmapRepo.findByUserId.mockResolvedValue([
        new Roadmap({
          id: 'r1',
          title: 'Web Roadmap',
          categoryId: 'c1',
          steps: [
            { concept: Concept.create('x', 'X'), order: 1, dependsOn: [] },
          ],
          createdAt: new Date(),
        }),
      ]);
      const useCase = new GetInsightsUseCase(
        userRepo,
        roadmapRepo,
        categoryRepo,
        cacheService,
        newsArticleRepo,
        newsService,
      );

      await useCase.execute('u1');

      expect(newsArticleRepo.findByCategorySlugs).toHaveBeenCalledWith([
        'web-development',
      ]);
    });
  });

  describe('caching', () => {
    it('serves from cache on subsequent calls', async () => {
      const {
        userRepo,
        roadmapRepo,
        categoryRepo,
        cacheService,
        newsArticleRepo,
        newsService,
      } = createMocks();
      const useCase = new GetInsightsUseCase(
        userRepo,
        roadmapRepo,
        categoryRepo,
        cacheService,
        newsArticleRepo,
        newsService,
      );

      await useCase.execute('u1'); // populates cache
      await useCase.execute('u1'); // should hit cache

      expect(newsArticleRepo.findByCategorySlugs).toHaveBeenCalledTimes(1);
    });

    it('does not cache empty results', async () => {
      const {
        userRepo,
        roadmapRepo,
        categoryRepo,
        cacheService,
        newsArticleRepo,
        newsService,
      } = createMocks();
      newsArticleRepo.findByCategorySlugs.mockResolvedValue([]);
      const useCase = new GetInsightsUseCase(
        userRepo,
        roadmapRepo,
        categoryRepo,
        cacheService,
        newsArticleRepo,
        newsService,
      );

      await useCase.execute('u1');

      expect(cacheService.set).not.toHaveBeenCalled();
    });
  });

  describe('on-demand fetch for empty categories', () => {
    it('fetches from news service when DB has no articles for a category', async () => {
      const {
        userRepo,
        roadmapRepo,
        categoryRepo,
        cacheService,
        newsArticleRepo,
        newsService,
      } = createMocks();
      // DB returns no articles
      newsArticleRepo.findByCategorySlugs.mockResolvedValue([]);
      // API returns articles
      newsService.fetchByCategory.mockResolvedValue([
        buildArticle('web-development', 0),
      ]);
      const useCase = new GetInsightsUseCase(
        userRepo,
        roadmapRepo,
        categoryRepo,
        cacheService,
        newsArticleRepo,
        newsService,
      );

      const result = await useCase.execute('u1');

      expect(newsService.fetchByCategory).toHaveBeenCalledWith(
        'web-development',
        'Web Development',
      );
      expect(newsArticleRepo.upsertMany).toHaveBeenCalled();
      expect(result.length).toBeGreaterThan(0);
    });

    it('does not fetch from API when DB already has articles', async () => {
      const {
        userRepo,
        roadmapRepo,
        categoryRepo,
        cacheService,
        newsArticleRepo,
        newsService,
      } = createMocks();
      const useCase = new GetInsightsUseCase(
        userRepo,
        roadmapRepo,
        categoryRepo,
        cacheService,
        newsArticleRepo,
        newsService,
      );

      await useCase.execute('u1');

      expect(newsService.fetchByCategory).not.toHaveBeenCalled();
    });
  });
});
