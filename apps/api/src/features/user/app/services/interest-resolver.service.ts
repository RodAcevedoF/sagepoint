import type { ICategoryRepository } from '@sagepoint/domain';
import { Category } from '@sagepoint/domain';
import { randomUUID } from 'crypto';

const CUSTOM_PREFIX = 'custom:';
const MAX_CUSTOM_NAME_LENGTH = 50;

export class InterestResolverService {
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async resolve(interests: string[]): Promise<Category[]> {
    const results = await Promise.all(
      interests.map((interest) => this.resolveOne(interest)),
    );
    return results.filter((c): c is Category => c !== null);
  }

  private async resolveOne(interest: string): Promise<Category | null> {
    if (interest.startsWith(CUSTOM_PREFIX)) {
      const name = interest
        .slice(CUSTOM_PREFIX.length)
        .trim()
        .slice(0, MAX_CUSTOM_NAME_LENGTH);
      if (!name) return null;
      return this.findOrCreate(name);
    }
    return this.categoryRepository.findById(interest);
  }

  private async findOrCreate(name: string): Promise<Category> {
    const slug = Category.slugify(name);
    const existing = await this.categoryRepository.findBySlug(slug);
    if (existing) return existing;

    const category = Category.create(randomUUID(), name, slug);
    return this.categoryRepository.save(category);
  }
}
