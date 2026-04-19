import { Neo4jService } from '@sagepoint/graph';
import {
  makeRoadmapDependencies,
  type RoadmapDependencies,
} from '@/features/roadmap/dependencies';
import {
  makeDocumentDependencies,
  type DocumentDependencies,
} from '@/features/document/dependencies';
import {
  makeUserDependencies,
  type UserDependencies,
} from '@/features/user/dependencies';
import {
  makeStorageDependencies,
  type StorageDependencies,
} from '@/features/storage/dependencies';
import {
  makeCategoryDependencies,
  type CategoryDependencies,
} from '@/features/category/dependencies';
import {
  makeAdminDependencies,
  type AdminDependencies,
} from '@/features/admin/dependencies';
import {
  makeInsightsDependencies,
  type InsightsDependencies,
} from '@/features/insights/dependencies';
import {
  makeInvitationDependencies,
  type InvitationDependencies,
} from '@/features/invitation/dependencies';
import {
  makeSocialDependencies,
  type SocialDependencies,
} from '@/features/social/dependencies';
import {
  makeBlogDependencies,
  type BlogDependencies,
} from '@/features/blog/dependencies';
import { GCSStorage } from '@sagepoint/storage';
import type { IFileStorage } from '@sagepoint/domain';
import Redis from 'ioredis';
import { RedisCacheService } from '@/core/infra/cache/redis-cache.service';
import { BcryptPasswordHasher } from '@/features/auth/infra/driven/bcrypt-password.hasher';
import { MockEmailService } from '@/features/auth/infra/driven/mock-email.service';
import { ResendEmailService } from '@/features/auth/infra/driven/resend-email.service';
import { PrismaService } from '@/core/infra/database/prisma.service';

export interface AppDependencies {
  roadmap: RoadmapDependencies;
  document: DocumentDependencies;
  user: UserDependencies;
  storage: StorageDependencies;
  category: CategoryDependencies;
  admin: AdminDependencies;
  insights: InsightsDependencies;
  invitation: InvitationDependencies;
  social: SocialDependencies;
  blog: BlogDependencies;
  fileStorage: IFileStorage;
  neo4jService: Neo4jService;
}

let dependencies: AppDependencies | null = null;

export function bootstrap(): AppDependencies {
  if (dependencies) {
    return dependencies;
  }

  // Shared infrastructure
  const prismaService = new PrismaService();

  const fileStorage: IFileStorage = new GCSStorage({
    projectId: process.env.GCP_PROJECT_ID!,
    bucketName: process.env.GCS_BUCKET_NAME!,
    keyFilename: process.env.GCP_KEY_FILE,
  });

  // User dependencies
  const userDeps = makeUserDependencies(prismaService, fileStorage);

  // Initialize Neo4j
  const neo4jService = new Neo4jService({
    uri: process.env.NEO4J_URI || 'bolt://localhost:7687',
    user: process.env.NEO4J_USER || 'neo4j',
    pass: process.env.NEO4J_PASSWORD || 'password',
    encrypted: process.env.NEO4J_ENCRYPTION || 'ENCRYPTION_OFF',
  });

  // Cache service for progress repository
  const cacheRedis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    db: parseInt(process.env.REDIS_DB || '0'),
    keyPrefix: 'cache:',
  });
  const cacheService = new RedisCacheService(cacheRedis);

  const roadmapDeps = makeRoadmapDependencies(
    prismaService,
    neo4jService,
    cacheService,
    userDeps.userRepository,
  );
  const categoryDeps = makeCategoryDependencies(prismaService, cacheService);

  dependencies = {
    roadmap: roadmapDeps,
    document: makeDocumentDependencies(
      prismaService,
      fileStorage,
      userDeps.userRepository,
    ),
    user: userDeps,
    storage: makeStorageDependencies(fileStorage),
    category: categoryDeps,
    admin: makeAdminDependencies(prismaService),
    insights: makeInsightsDependencies(
      prismaService,
      userDeps.userRepository,
      roadmapDeps.roadmapRepository,
      categoryDeps.categoryRepository,
      cacheService,
    ),
    social: makeSocialDependencies(prismaService, roadmapDeps.roadmapService),
    blog: makeBlogDependencies(prismaService, cacheService),
    invitation: makeInvitationDependencies(
      prismaService,
      userDeps.userRepository,
      process.env.EMAIL_PROVIDER === 'resend'
        ? new ResendEmailService({
            apiKey: process.env.RESEND_API_KEY || '',
            fromEmail:
              process.env.RESEND_FROM_EMAIL ||
              'Sagepoint <onboarding@resend.dev>',
            frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
          })
        : new MockEmailService(),
      new BcryptPasswordHasher(),
    ),
    fileStorage,
    neo4jService,
  };

  return dependencies;
}

export function getDependencies(): AppDependencies {
  if (!dependencies) {
    throw new Error('Dependencies not initialized. Call bootstrap() first.');
  }
  return dependencies;
}
