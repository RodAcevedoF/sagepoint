import type {
  IAdminRepository,
  AdminDocumentView,
  PaginatedResult,
} from '../../domain/outbound/admin.repository.port';

export class ListDocumentsUseCase {
  constructor(private readonly adminRepository: IAdminRepository) {}

  async execute(query: {
    stage?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResult<AdminDocumentView>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const { data, total } = await this.adminRepository.findDocuments({
      stage: query.stage,
      status: query.status,
      skip,
      take: limit,
    });

    return { data, total, page, limit };
  }
}
