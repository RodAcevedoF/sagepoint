import type {
  Category,
  Roadmap,
  ICategoryRepository,
  ICategoryRoomRepository,
  ICacheService,
} from '@sagepoint/domain';

export interface CategoryRoomDetail {
  category: Category;
  roadmapCount: number;
  memberCount: number;
  roadmaps: { items: Roadmap[]; total: number };
}

const TTL = 180; // 3 minutes

export class GetCategoryRoomDetailUseCase {
  constructor(
    private readonly categoryRepo: ICategoryRepository,
    private readonly roomRepo: ICategoryRoomRepository,
    private readonly cache?: ICacheService,
  ) {}

  async execute(
    slug: string,
    options: { search?: string; page: number; pageSize: number },
  ): Promise<CategoryRoomDetail | null> {
    const category = await this.categoryRepo.findBySlug(slug);
    if (!category) return null;

    // Cache stats only (not paginated results)
    let stats: { roadmapCount: number; memberCount: number } | null = null;
    const cacheKey = `category-rooms:detail:${slug}:stats`;

    if (this.cache && !options.search) {
      stats = await this.cache.get(cacheKey);
    }

    const [resolvedStats, roadmaps] = await Promise.all([
      stats ?? this.roomRepo.getRoomStats(category.id),
      this.roomRepo.findPublicRoadmapsByCategorySlug(slug, options),
    ]);

    if (!stats && resolvedStats && this.cache && !options.search) {
      await this.cache.set(cacheKey, resolvedStats, TTL);
    }

    return {
      category,
      roadmapCount: resolvedStats?.roadmapCount ?? 0,
      memberCount: resolvedStats?.memberCount ?? 0,
      roadmaps,
    };
  }
}
