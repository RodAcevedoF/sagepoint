import type {
  ICategoryRepository,
  ICategoryRoomRepository,
  ICacheService,
} from '@sagepoint/domain';

export interface CategoryRoom {
  id: string;
  name: string;
  slug: string;
  description?: string;
  roadmapCount: number;
  memberCount: number;
}

const CACHE_KEY = 'category-rooms:list';
const TTL = 300; // 5 minutes

export class GetCategoryRoomsUseCase {
  constructor(
    private readonly categoryRepo: ICategoryRepository,
    private readonly roomRepo: ICategoryRoomRepository,
    private readonly cache?: ICacheService,
  ) {}

  async execute(): Promise<CategoryRoom[]> {
    if (this.cache) {
      const cached = await this.cache.get<CategoryRoom[]>(CACHE_KEY);
      if (cached) return cached;
    }

    const [categories, stats] = await Promise.all([
      this.categoryRepo.list(),
      this.roomRepo.listRoomStats(),
    ]);

    const statsMap = new Map(stats.map((s) => [s.categoryId, s]));

    const rooms: CategoryRoom[] = categories
      .filter((c) => statsMap.has(c.id))
      .map((c) => {
        const s = statsMap.get(c.id)!;
        return {
          id: c.id,
          name: c.name,
          slug: c.slug,
          description: c.description,
          roadmapCount: s.roadmapCount,
          memberCount: s.memberCount,
        };
      })
      .sort((a, b) => b.roadmapCount - a.roadmapCount);

    if (this.cache) {
      await this.cache.set(CACHE_KEY, rooms, TTL);
    }

    return rooms;
  }
}
