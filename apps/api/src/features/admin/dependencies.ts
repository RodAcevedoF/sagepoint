import { Queue } from 'bullmq';
import type { IAdminService } from './domain/inbound/admin.service.port';
import type { IAdminRepository } from './domain/outbound/admin.repository.port';
import type { IQueueStatsProvider } from './domain/outbound/queue-stats.port';
import type { PrismaClient } from '@sagepoint/database';
import { PrismaResourceLimitsRepository } from '@sagepoint/database';
import { PrismaAdminRepository } from './infra/driven/prisma-admin.repository';
import { BullMQQueueStatsProvider } from './infra/driven/bullmq-queue-stats.provider';
import { AdminService } from './infra/driver/admin.service';
import { GetPlatformStatsUseCase } from './app/usecases/get-platform-stats.usecase';
import { GetQueueStatsUseCase } from './app/usecases/get-queue-stats.usecase';
import { GetAnalyticsUseCase } from './app/usecases/get-analytics.usecase';
import { ListUsersUseCase } from './app/usecases/list-users.usecase';
import { UpdateUserUseCase } from './app/usecases/update-user.usecase';
import { DeleteUserUseCase } from './app/usecases/delete-user.usecase';
import { ListRoadmapsUseCase } from './app/usecases/list-roadmaps.usecase';
import { DeleteRoadmapUseCase } from './app/usecases/delete-roadmap.usecase';
import { ToggleRoadmapFeaturedUseCase } from './app/usecases/toggle-roadmap-featured.usecase';
import { ListDocumentsUseCase } from './app/usecases/list-documents.usecase';
import { DeleteDocumentUseCase } from './app/usecases/delete-document.usecase';
import { GetUserLimitsUseCase } from './app/usecases/get-user-limits.usecase';
import { UpdateUserLimitsUseCase } from './app/usecases/update-user-limits.usecase';

export interface AdminDependencies {
  adminService: IAdminService;
  adminRepository: IAdminRepository;
  queueStatsProvider: IQueueStatsProvider;
}

export function makeAdminDependencies(
  prismaService: PrismaClient,
): AdminDependencies {
  const adminRepository = new PrismaAdminRepository(prismaService);
  const resourceLimitsRepository = new PrismaResourceLimitsRepository(
    prismaService,
  );

  const redisConnection = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    db: parseInt(process.env.REDIS_DB || '0'),
  };
  const documentQueue = new Queue('document-processing', {
    connection: redisConnection,
  });
  const roadmapQueue = new Queue('roadmap-generation', {
    connection: redisConnection,
  });
  const queueStatsProvider = new BullMQQueueStatsProvider(
    documentQueue,
    roadmapQueue,
  );

  // Use cases
  const getPlatformStatsUseCase = new GetPlatformStatsUseCase(adminRepository);
  const getQueueStatsUseCase = new GetQueueStatsUseCase(queueStatsProvider);
  const getAnalyticsUseCase = new GetAnalyticsUseCase(adminRepository);
  const listUsersUseCase = new ListUsersUseCase(adminRepository);
  const updateUserUseCase = new UpdateUserUseCase(adminRepository);
  const deleteUserUseCase = new DeleteUserUseCase(adminRepository);
  const listRoadmapsUseCase = new ListRoadmapsUseCase(adminRepository);
  const deleteRoadmapUseCase = new DeleteRoadmapUseCase(adminRepository);
  const toggleRoadmapFeaturedUseCase = new ToggleRoadmapFeaturedUseCase(
    adminRepository,
  );
  const listDocumentsUseCase = new ListDocumentsUseCase(adminRepository);
  const deleteDocumentUseCase = new DeleteDocumentUseCase(adminRepository);
  const getUserLimitsUseCase = new GetUserLimitsUseCase(
    resourceLimitsRepository,
  );
  const updateUserLimitsUseCase = new UpdateUserLimitsUseCase(
    adminRepository,
    resourceLimitsRepository,
  );

  const adminService = new AdminService(
    getPlatformStatsUseCase,
    getQueueStatsUseCase,
    getAnalyticsUseCase,
    listUsersUseCase,
    updateUserUseCase,
    deleteUserUseCase,
    listRoadmapsUseCase,
    deleteRoadmapUseCase,
    toggleRoadmapFeaturedUseCase,
    listDocumentsUseCase,
    deleteDocumentUseCase,
    getUserLimitsUseCase,
    updateUserLimitsUseCase,
  );

  return { adminService, adminRepository, queueStatsProvider };
}
