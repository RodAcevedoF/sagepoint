import type { Category } from '@sagepoint/domain';
import type { CategoryRoom } from '@/features/category/app/usecases/get-category-rooms.usecase';
import type { CategoryRoomDetail } from '@/features/category/app/usecases/get-category-room-detail.usecase';

export const CATEGORY_SERVICE = Symbol('CATEGORY_SERVICE');

export interface CreateCategoryInput {
  name: string;
  slug: string;
}

export interface ICategoryService {
  getAll(): Promise<Category[]>;
  create(input: CreateCategoryInput): Promise<Category>;
  getRooms(): Promise<CategoryRoom[]>;
  getRoomDetail(
    slug: string,
    options: { search?: string; page?: number; pageSize?: number },
  ): Promise<CategoryRoomDetail | null>;
}
