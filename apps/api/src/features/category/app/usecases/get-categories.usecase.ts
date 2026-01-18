import { Category, ICategoryRepository } from '@sagepoint/domain';

export class GetCategoriesUseCase {
  constructor(private readonly repository: ICategoryRepository) {}

  async execute(): Promise<Category[]> {
    return this.repository.list();
  }
}
