import { GetCategoriesUseCase } from '../../../src/features/category/app/usecases/get-categories.usecase';
import { Category } from '@sagepoint/domain';
import {
  FakeCategoryRepository,
  FakeCacheService,
} from '../_fakes/repositories';

const WEB_DEV = Category.create('c1', 'Web Development', 'web-development');
const DATA_SCI = Category.create('c2', 'Data Science', 'data-science');

describe('GetCategoriesUseCase', () => {
  let categoryRepo: FakeCategoryRepository;
  let cache: FakeCacheService;

  beforeEach(() => {
    categoryRepo = new FakeCategoryRepository();
    cache = new FakeCacheService();
    categoryRepo.seed(WEB_DEV, DATA_SCI);
  });

  describe('with cache', () => {
    it('returns categories from repository and caches them on first call', async () => {
      const useCase = new GetCategoriesUseCase(categoryRepo, cache);

      const result = await useCase.execute();

      expect(result).toHaveLength(2);
      expect(cache.has('categories:all')).toBe(true);
    });

    it('returns cached categories on subsequent calls', async () => {
      const useCase = new GetCategoriesUseCase(categoryRepo, cache);
      await useCase.execute(); // populates cache

      // Remove from repo to prove cache is used
      categoryRepo = new FakeCategoryRepository();
      const useCase2 = new GetCategoriesUseCase(categoryRepo, cache);

      const result = await useCase2.execute();

      expect(result).toHaveLength(2);
    });
  });

  describe('without cache', () => {
    it('returns categories directly from repository', async () => {
      const useCase = new GetCategoriesUseCase(categoryRepo);

      const result = await useCase.execute();

      expect(result).toHaveLength(2);
    });
  });
});
