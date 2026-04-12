import type {
  AdminUserView,
  AdminRoadmapView,
  AdminDocumentView,
  DailyCount,
  PaginatedResult,
} from '../outbound/admin.repository.port';
import type { QueueStats } from '../outbound/queue-stats.port';
import type { TokenBalance } from '@sagepoint/domain';

export const ADMIN_SERVICE = Symbol('ADMIN_SERVICE');

export interface PlatformStats {
  userCount: number;
  documentCount: number;
  roadmapCount: number;
  quizCount: number;
  documentsByStage: Record<string, number>;
}

export interface AnalyticsResult {
  signups: DailyCount[];
  uploads: DailyCount[];
  generations: DailyCount[];
}

export interface IAdminService {
  getStats(): Promise<PlatformStats>;
  getQueueStats(): Promise<{
    documentQueue: QueueStats;
    roadmapQueue: QueueStats;
  }>;
  getUsers(): Promise<AdminUserView[]>;
  updateUser(
    id: string,
    data: { role?: string; isActive?: boolean },
  ): Promise<AdminUserView>;
  deleteUser(id: string): Promise<{ success: true }>;
  getRoadmaps(query: {
    status?: string;
    categoryId?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResult<AdminRoadmapView>>;
  deleteRoadmap(id: string): Promise<{ success: true }>;
  toggleRoadmapFeatured(
    id: string,
  ): Promise<{ id: string; isFeatured: boolean }>;
  getDocuments(query: {
    stage?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResult<AdminDocumentView>>;
  deleteDocument(id: string): Promise<{ success: true }>;
  getAnalytics(days: number): Promise<AnalyticsResult>;
  getUserLimits(userId: string): Promise<TokenBalance>;
  updateUserLimits(
    userId: string,
    data: { balance?: number | null; credit?: number },
  ): Promise<TokenBalance>;
}
