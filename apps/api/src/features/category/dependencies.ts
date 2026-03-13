import type { ICategoryService } from '@/features/category/domain/inbound/category.service';
import type { ICategoryRepository, ICacheService } from '@sagepoint/domain';
import { CategoryService } from '@/features/category/infra/driver/category.service';
import { GetCategoriesUseCase } from './app/usecases/get-categories.usecase';
import { CreateCategoryUseCase } from './app/usecases/create-category.usecase';
import { PrismaCategoryRepository } from './infra/adapter/prisma-category.repository';
import { PrismaService } from '@/core/infra/database/prisma.service';

export interface CategoryDependencies {
  categoryService: ICategoryService;
  categoryRepository: ICategoryRepository;
}

export function makeCategoryDependencies(
  cache?: ICacheService,
): CategoryDependencies {
  const prismaService = new PrismaService();
  const categoryRepository = new PrismaCategoryRepository(prismaService);

  const getCategoriesUseCase = new GetCategoriesUseCase(
    categoryRepository,
    cache,
  );
  const createCategoryUseCase = new CreateCategoryUseCase(categoryRepository);

  const categoryService = new CategoryService(
    getCategoriesUseCase,
    createCategoryUseCase,
  );

  return {
    categoryService,
    categoryRepository,
  };
}
