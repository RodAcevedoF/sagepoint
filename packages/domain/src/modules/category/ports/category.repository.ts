import { Category } from "../entities/category.entity";

export const CATEGORY_REPOSITORY = Symbol("CATEGORY_REPOSITORY");

export interface ICategoryRepository {
  save(category: Category): Promise<Category>;
  /** Atomically find by slug or create — prevents TOCTOU duplicates. */
  findOrCreateBySlug(category: Category): Promise<Category>;
  findById(id: string): Promise<Category | null>;
  findBySlug(slug: string): Promise<Category | null>;
  list(): Promise<Category[]>;
  /** Categories that at least one user has selected as an interest. */
  listWithActiveInterests(): Promise<Category[]>;
  /** Categories referenced by at least one roadmap. */
  listWithActiveRoadmaps(): Promise<Category[]>;
  /** Top categories ranked by user-interest count, descending. */
  listMostPopular(limit: number): Promise<Category[]>;
  delete(id: string): Promise<void>;
}
