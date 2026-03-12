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
    `Article about ${slug}`,
    `Description for ${slug}`,
    `https://example.com/${slug}/${daysAgo}`,
    null,
    'TechBlog',
    date.toISOString(),
    slug,
  );
}

function createMocks() {
  const cache = new Map<string, unknown>();

  // Minimal stubs: only the methods GetInsightsUseCase actually calls.
  // Intersection types expose jest.Mock where tests need to reassign/assert.
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

  const newsService = {
    fetchByCategory: jest
      .fn()
      .mockImplementation((slug: string) =>
        Promise.resolve([buildArticle(slug, 1), buildArticle(slug, 2)]),
      ),
  } as unknown as INewsService & { fetchByCategory: jest.Mock };

  return {
    userRepo,
    roadmapRepo,
    categoryRepo,
    cacheService,
    newsService,
    cache,
  };
}

describe('GetInsightsUseCase', () => {
  describe('fetching news by user interests', () => {
    it('returns articles for categories the user is interested in', async () => {
      const { userRepo, roadmapRepo, categoryRepo, cacheService, newsService } =
        createMocks();
      const useCase = new GetInsightsUseCase(
        userRepo,
        roadmapRepo,
        categoryRepo,
        cacheService,
        newsService,
      );

      const result = await useCase.execute('u1');

      expect(result.length).toBeGreaterThan(0);
      expect(newsService.fetchByCategory).toHaveBeenCalledWith(
        'web-development',
        'Web Development',
      );
    });

    it('returns empty array when user has no interests and no roadmaps', async () => {
      const { userRepo, roadmapRepo, categoryRepo, cacheService, newsService } =
        createMocks();
      userRepo.findById.mockResolvedValue(
        User.create('u1', 'test@example.com', 'Test'),
      );
      const useCase = new GetInsightsUseCase(
        userRepo,
        roadmapRepo,
        categoryRepo,
        cacheService,
        newsService,
      );

      const result = await useCase.execute('u1');

      expect(result).toEqual([]);
      expect(newsService.fetchByCategory).not.toHaveBeenCalled();
    });

    it('returns empty array when user does not exist', async () => {
      const { userRepo, roadmapRepo, categoryRepo, cacheService, newsService } =
        createMocks();
      userRepo.findById.mockResolvedValue(null);
      const useCase = new GetInsightsUseCase(
        userRepo,
        roadmapRepo,
        categoryRepo,
        cacheService,
        newsService,
      );

      expect(await useCase.execute('nonexistent')).toEqual([]);
    });
  });

  describe('category merging from roadmaps', () => {
    it('includes categories from user roadmaps', async () => {
      const { userRepo, roadmapRepo, categoryRepo, cacheService, newsService } =
        createMocks();
      // User has no interests
      userRepo.findById.mockResolvedValue(User.create('u1', 'a@b.com', 'A'));
      // But has a roadmap with ML category
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
        newsService,
      );

      const result = await useCase.execute('u1');

      expect(newsService.fetchByCategory).toHaveBeenCalledWith(
        'machine-learning',
        'Machine Learning',
      );
      expect(result.length).toBeGreaterThan(0);
    });

    it('deduplicates categories from interests and roadmaps', async () => {
      const { userRepo, roadmapRepo, categoryRepo, cacheService, newsService } =
        createMocks();
      // User interested in web-dev AND has a roadmap with web-dev category
      roadmapRepo.findByUserId.mockResolvedValue([
        new Roadmap({
          id: 'r1',
          title: 'Web Roadmap',
          categoryId: 'c1', // same as user interest
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
        newsService,
      );

      await useCase.execute('u1');

      // Should only fetch once for web-development, not twice
      expect(newsService.fetchByCategory).toHaveBeenCalledTimes(1);
    });
  });

  describe('caching', () => {
    it('serves from cache on subsequent calls', async () => {
      const { userRepo, roadmapRepo, categoryRepo, cacheService, newsService } =
        createMocks();
      const useCase = new GetInsightsUseCase(
        userRepo,
        roadmapRepo,
        categoryRepo,
        cacheService,
        newsService,
      );

      await useCase.execute('u1'); // populates cache
      await useCase.execute('u1'); // should hit cache

      expect(newsService.fetchByCategory).toHaveBeenCalledTimes(1);
    });

    it('does not cache empty results', async () => {
      const { userRepo, roadmapRepo, categoryRepo, cacheService, newsService } =
        createMocks();
      newsService.fetchByCategory.mockResolvedValue([]);
      const useCase = new GetInsightsUseCase(
        userRepo,
        roadmapRepo,
        categoryRepo,
        cacheService,
        newsService,
      );

      await useCase.execute('u1');

      expect(cacheService.set).not.toHaveBeenCalled();
    });
  });

  describe('sorting and limiting', () => {
    it('returns articles sorted by publishedAt descending, limited to 20', async () => {
      const { userRepo, roadmapRepo, categoryRepo, cacheService, newsService } =
        createMocks();
      // Return many articles
      newsService.fetchByCategory.mockResolvedValue(
        Array.from({ length: 25 }, (_, i) =>
          buildArticle('web-development', i),
        ),
      );
      const useCase = new GetInsightsUseCase(
        userRepo,
        roadmapRepo,
        categoryRepo,
        cacheService,
        newsService,
      );

      const result = await useCase.execute('u1');

      expect(result).toHaveLength(20);
      // First article should be the most recent
      expect(new Date(result[0].publishedAt).getTime()).toBeGreaterThanOrEqual(
        new Date(result[1].publishedAt).getTime(),
      );
    });
  });
});
