import {
  Category,
  ICategoryRepository,
  type ICacheService,
} from '@sagepoint/domain';

const CACHE_KEY = 'categories:all';
const TTL_SECONDS = 86400; // 24 hours

export class GetCategoriesUseCase {
  constructor(
    private readonly repository: ICategoryRepository,
    private readonly cache?: ICacheService,
  ) {}

  async execute(): Promise<Category[]> {
    if (this.cache) {
      const cached = await this.cache.get<Category[]>(CACHE_KEY);
      if (cached) return cached;
    }

    const categories = await this.repository.list();

    if (this.cache) {
      await this.cache.set(CACHE_KEY, categories, TTL_SECONDS);
    }

    return categories;
  }
}
