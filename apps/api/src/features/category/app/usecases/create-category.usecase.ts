import { Category, type ICategoryRepository } from '@sagepoint/domain';

export class CreateCategoryUseCase {
  constructor(private readonly repository: ICategoryRepository) {}

  async execute(name: string, slug: string): Promise<Category> {
    const id = crypto.randomUUID();
    const category = Category.create(id, name, slug);
    return this.repository.save(category);
  }
}
