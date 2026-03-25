import type {
  IAdminRepository,
  AdminRoadmapView,
  PaginatedResult,
} from '../../domain/outbound/admin.repository.port';

export class ListRoadmapsUseCase {
  constructor(private readonly adminRepository: IAdminRepository) {}

  async execute(query: {
    status?: string;
    categoryId?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResult<AdminRoadmapView>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const { data, total } = await this.adminRepository.findRoadmaps({
      status: query.status,
      categoryId: query.categoryId,
      skip,
      take: limit,
    });

    return { data, total, page, limit };
  }
}
