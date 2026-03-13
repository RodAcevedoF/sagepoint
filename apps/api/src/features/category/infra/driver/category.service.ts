import type { Category } from '@sagepoint/domain';
import type {
  ICategoryService,
  CreateCategoryInput,
} from '@/features/category/domain/inbound/category.service';
import type { GetCategoriesUseCase } from '@/features/category/app/usecases/get-categories.usecase';
import type { CreateCategoryUseCase } from '@/features/category/app/usecases/create-category.usecase';

export class CategoryService implements ICategoryService {
  constructor(
    private readonly getCategoriesUseCase: GetCategoriesUseCase,
    private readonly createCategoryUseCase: CreateCategoryUseCase,
  ) {}

  async getAll(): Promise<Category[]> {
    return this.getCategoriesUseCase.execute();
  }

  async create(input: CreateCategoryInput): Promise<Category> {
    return this.createCategoryUseCase.execute(input.name, input.slug);
  }
}
