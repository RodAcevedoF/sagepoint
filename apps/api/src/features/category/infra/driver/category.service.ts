import type { Category } from '@sagepoint/domain';
import type {
  ICategoryService,
  CreateCategoryInput,
} from '@/features/category/domain/inbound/category.service';
import type { GetCategoriesUseCase } from '@/features/category/app/usecases/get-categories.usecase';
import type { CreateCategoryUseCase } from '@/features/category/app/usecases/create-category.usecase';
import type {
  GetCategoryRoomsUseCase,
  CategoryRoom,
} from '@/features/category/app/usecases/get-category-rooms.usecase';
import type {
  GetCategoryRoomDetailUseCase,
  CategoryRoomDetail,
} from '@/features/category/app/usecases/get-category-room-detail.usecase';

export class CategoryService implements ICategoryService {
  constructor(
    private readonly getCategoriesUseCase: GetCategoriesUseCase,
    private readonly createCategoryUseCase: CreateCategoryUseCase,
    private readonly getCategoryRoomsUseCase?: GetCategoryRoomsUseCase,
    private readonly getCategoryRoomDetailUseCase?: GetCategoryRoomDetailUseCase,
  ) {}

  async getAll(): Promise<Category[]> {
    return this.getCategoriesUseCase.execute();
  }

  async create(input: CreateCategoryInput): Promise<Category> {
    return this.createCategoryUseCase.execute(input.name, input.slug);
  }

  async getRooms(): Promise<CategoryRoom[]> {
    if (!this.getCategoryRoomsUseCase) return [];
    return this.getCategoryRoomsUseCase.execute();
  }

  async getRoomDetail(
    slug: string,
    options: { search?: string; page?: number; pageSize?: number },
  ): Promise<CategoryRoomDetail | null> {
    if (!this.getCategoryRoomDetailUseCase) return null;
    return this.getCategoryRoomDetailUseCase.execute(slug, {
      search: options.search,
      page: options.page ?? 1,
      pageSize: options.pageSize ?? 12,
    });
  }
}
