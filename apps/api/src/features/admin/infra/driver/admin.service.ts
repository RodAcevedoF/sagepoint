import type {
  IAdminService,
  PlatformStats,
  AnalyticsResult,
} from '../../domain/inbound/admin.service.port';
import type {
  AdminUserView,
  AdminRoadmapView,
  AdminDocumentView,
  PaginatedResult,
} from '../../domain/outbound/admin.repository.port';
import type { QueueStats } from '../../domain/outbound/queue-stats.port';
import type { TokenBalance } from '@sagepoint/domain';
import { GetPlatformStatsUseCase } from '../../app/usecases/get-platform-stats.usecase';
import { GetQueueStatsUseCase } from '../../app/usecases/get-queue-stats.usecase';
import { GetAnalyticsUseCase } from '../../app/usecases/get-analytics.usecase';
import { ListUsersUseCase } from '../../app/usecases/list-users.usecase';
import { UpdateUserUseCase } from '../../app/usecases/update-user.usecase';
import { DeleteUserUseCase } from '../../app/usecases/delete-user.usecase';
import { ListRoadmapsUseCase } from '../../app/usecases/list-roadmaps.usecase';
import { DeleteRoadmapUseCase } from '../../app/usecases/delete-roadmap.usecase';
import { ToggleRoadmapFeaturedUseCase } from '../../app/usecases/toggle-roadmap-featured.usecase';
import { ListDocumentsUseCase } from '../../app/usecases/list-documents.usecase';
import { DeleteDocumentUseCase } from '../../app/usecases/delete-document.usecase';
import { GetUserLimitsUseCase } from '../../app/usecases/get-user-limits.usecase';
import { UpdateUserLimitsUseCase } from '../../app/usecases/update-user-limits.usecase';

export class AdminService implements IAdminService {
  constructor(
    private readonly getPlatformStatsUseCase: GetPlatformStatsUseCase,
    private readonly getQueueStatsUseCase: GetQueueStatsUseCase,
    private readonly getAnalyticsUseCase: GetAnalyticsUseCase,
    private readonly listUsersUseCase: ListUsersUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
    private readonly listRoadmapsUseCase: ListRoadmapsUseCase,
    private readonly deleteRoadmapUseCase: DeleteRoadmapUseCase,
    private readonly toggleRoadmapFeaturedUseCase: ToggleRoadmapFeaturedUseCase,
    private readonly listDocumentsUseCase: ListDocumentsUseCase,
    private readonly deleteDocumentUseCase: DeleteDocumentUseCase,
    private readonly getUserLimitsUseCase: GetUserLimitsUseCase,
    private readonly updateUserLimitsUseCase: UpdateUserLimitsUseCase,
  ) {}

  async getStats(): Promise<PlatformStats> {
    return this.getPlatformStatsUseCase.execute();
  }

  async getQueueStats(): Promise<{
    documentQueue: QueueStats;
    roadmapQueue: QueueStats;
  }> {
    return this.getQueueStatsUseCase.execute();
  }

  async getUsers(): Promise<AdminUserView[]> {
    return this.listUsersUseCase.execute();
  }

  async updateUser(
    id: string,
    data: { role?: string; isActive?: boolean },
  ): Promise<AdminUserView> {
    return this.updateUserUseCase.execute(id, data);
  }

  async deleteUser(id: string): Promise<{ success: true }> {
    return this.deleteUserUseCase.execute(id);
  }

  async getRoadmaps(query: {
    status?: string;
    categoryId?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResult<AdminRoadmapView>> {
    return this.listRoadmapsUseCase.execute(query);
  }

  async deleteRoadmap(id: string): Promise<{ success: true }> {
    return this.deleteRoadmapUseCase.execute(id);
  }

  async toggleRoadmapFeatured(
    id: string,
  ): Promise<{ id: string; isFeatured: boolean }> {
    return this.toggleRoadmapFeaturedUseCase.execute(id);
  }

  async getDocuments(query: {
    stage?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResult<AdminDocumentView>> {
    return this.listDocumentsUseCase.execute(query);
  }

  async deleteDocument(id: string): Promise<{ success: true }> {
    return this.deleteDocumentUseCase.execute(id);
  }

  async getAnalytics(days: number): Promise<AnalyticsResult> {
    return this.getAnalyticsUseCase.execute(days);
  }

  async getUserLimits(userId: string): Promise<TokenBalance> {
    return this.getUserLimitsUseCase.execute(userId);
  }

  async updateUserLimits(
    userId: string,
    data: { balance?: number | null; credit?: number },
  ): Promise<TokenBalance> {
    return this.updateUserLimitsUseCase.execute({ userId, ...data });
  }
}
