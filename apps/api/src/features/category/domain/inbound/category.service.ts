import type { Category } from '@sagepoint/domain';

export const CATEGORY_SERVICE = Symbol('CATEGORY_SERVICE');

export interface CreateCategoryInput {
  name: string;
  slug: string;
}

export interface ICategoryService {
  getAll(): Promise<Category[]>;
  create(input: CreateCategoryInput): Promise<Category>;
}
