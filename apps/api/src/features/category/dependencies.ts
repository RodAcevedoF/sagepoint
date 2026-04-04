import type { ICategoryService } from '@/features/category/domain/inbound/category.service';
import type { ICategoryRepository, ICacheService } from '@sagepoint/domain';
import { CategoryService } from '@/features/category/infra/driver/category.service';
import { GetCategoriesUseCase } from './app/usecases/get-categories.usecase';
import { CreateCategoryUseCase } from './app/usecases/create-category.usecase';
import { GetCategoryRoomsUseCase } from './app/usecases/get-category-rooms.usecase';
import { GetCategoryRoomDetailUseCase } from './app/usecases/get-category-room-detail.usecase';
import {
  PrismaCategoryRepository,
  PrismaCategoryRoomRepository,
} from '@sagepoint/database';
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
  const roomRepository = new PrismaCategoryRoomRepository(prismaService);

  const getCategoriesUseCase = new GetCategoriesUseCase(
    categoryRepository,
    cache,
  );
  const createCategoryUseCase = new CreateCategoryUseCase(categoryRepository);
  const getCategoryRoomsUseCase = new GetCategoryRoomsUseCase(
    categoryRepository,
    roomRepository,
    cache,
  );
  const getCategoryRoomDetailUseCase = new GetCategoryRoomDetailUseCase(
    categoryRepository,
    roomRepository,
    cache,
  );

  const categoryService = new CategoryService(
    getCategoriesUseCase,
    createCategoryUseCase,
    getCategoryRoomsUseCase,
    getCategoryRoomDetailUseCase,
  );

  return {
    categoryService,
    categoryRepository,
  };
}
