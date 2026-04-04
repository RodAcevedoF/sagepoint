import type { Roadmap } from "../../roadmap/entities/roadmap.entity";

export const CATEGORY_ROOM_REPOSITORY = Symbol("CATEGORY_ROOM_REPOSITORY");

export interface CategoryRoomStats {
  categoryId: string;
  roadmapCount: number;
  memberCount: number;
}

export interface ICategoryRoomRepository {
  listRoomStats(): Promise<CategoryRoomStats[]>;
  getRoomStats(categoryId: string): Promise<CategoryRoomStats | null>;
  findPublicRoadmapsByCategorySlug(
    slug: string,
    options: { search?: string; page: number; pageSize: number },
  ): Promise<{ items: Roadmap[]; total: number }>;
}
